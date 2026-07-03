<?php

class Jwt
{
    public static function generate(array $payload, ?int $ttl = null): string
    {
        $issuedAt = time();
        $expiresAt = $issuedAt + ($ttl ?? (int) app_config('jwt_ttl', 86400));

        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];

        $payload = array_merge($payload, [
            'iat' => $issuedAt,
            'exp' => $expiresAt,
        ]);

        $segments = [
            self::base64UrlEncode(json_encode($header)),
            self::base64UrlEncode(json_encode($payload)),
        ];

        $signature = self::sign(implode('.', $segments));
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    public static function verify(string $token): ?array
    {
        $segments = explode('.', $token);

        if (count($segments) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $segments;
        $signature = self::base64UrlDecode($encodedSignature);
        $expectedSignature = self::sign($encodedHeader . '.' . $encodedPayload);

        if (! hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);

        if (! is_array($payload)) {
            return null;
        }

        if (! isset($payload['exp']) || (int) $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private static function sign(string $data): string
    {
        return hash_hmac('sha256', $data, (string) app_config('jwt_secret'), true);
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }

        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }
}
