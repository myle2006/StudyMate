<div id="root"></div>

<script>
  window.STUDYMATE_BASE_PATH = <?= json_encode(base_url_path(), JSON_UNESCAPED_SLASHES) ?>;
  window.STUDYMATE_DATA = <?= json_encode($pageData ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
</script>
<script type="text/babel" src="<?= asset('js/home.js') ?>"></script>
