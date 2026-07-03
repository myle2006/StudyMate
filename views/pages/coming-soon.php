<main class="min-h-screen bg-slate-50 px-5 py-16 text-slate-950">
  <div class="mx-auto max-w-3xl rounded-[8px] border border-slate-200 bg-white p-8 shadow-sm">
    <a href="<?= url('/') ?>" class="text-sm font-bold text-blue-600">← Về trang chủ</a>
    <h1 class="mt-6 text-4xl font-extrabold"><?= e($heading ?? 'StudyMate AI') ?></h1>
    <p class="mt-4 text-lg leading-8 text-slate-600"><?= e($message ?? '') ?></p>
  </div>
</main>
