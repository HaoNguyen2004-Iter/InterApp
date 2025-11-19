(function () {
    function $(id) { return document.getElementById(id); }
    function setStatus(text, show) {
        var s = $('iconUploadStatus');
        if (!s) return;
        s.style.display = show ? 'block' : 'none';
        s.textContent = text || '';
    }

    function isUrl(val) {
        if (!val) return false;
        return val.indexOf('data:') === 0 || val.indexOf('/') === 0 || val.indexOf('http') === 0;
    }

    function init() {
        var fileInput = $('IconFile');
        var preview = $('iconPreview');
        var hidden = $('Icon');
        var manual = $('IconManual');
        var btnApply = $('btnApplyManualIcon');

        // Apply manual URL button
        if (btnApply) btnApply.addEventListener('click', function () {
            var url = (manual.value || '').trim();
            if (!url) return;
            hidden.value = url;
            if (isUrl(url)) preview.src = url;
        });

        // live preview when typing manual url
        if (manual) manual.addEventListener('input', function () {
            var url = (manual.value || '').trim();
            if (isUrl(url)) preview.src = url;
        });

        // when submitting the form make sure manual value is copied to hidden
        (function attachFormSubmit() {
            var form = preview ? preview.closest('form') : null;
            if (!form) return;
            form.addEventListener('submit', function () {
                if (manual && manual.value && manual.value.trim()) {
                    hidden.value = manual.value.trim();
                }
            });
        })();

        if (!fileInput) return;

        fileInput.addEventListener('change', function (e) {
            var f = e.target.files && e.target.files[0];
            if (!f) return;

            // quick client preview
            try { preview.src = URL.createObjectURL(f); } catch (ex) { }

            var fd = new FormData();
            fd.append('file', f);

            setStatus('Đang tải lên...', true);

            fetch('/apimedia/TempUpload', {
                method: 'POST',
                body: fd,
                credentials: 'same-origin'
            }).then(function (res) {
                return res.json();
            }).then(function (result) {
                setStatus('', false);
                if (typeof result === 'string' && result.length > 0) {
                    var url = result;
                    hidden.value = url;
                    preview.src = url;
                    if (manual) manual.value = url;
                } else if (result && result.url) {
                    hidden.value = result.url;
                    preview.src = result.url;
                    if (manual) manual.value = result.url;
                } else {
                    setStatus('Upload thất bại', true);
                    setTimeout(function () { setStatus('', false); }, 2500);
                }
            }).catch(function (err) {
                console.error(err);
                setStatus('Lỗi khi upload', true);
                setTimeout(function () { setStatus('', false); }, 2500);
            }).finally(function () {
                try { fileInput.value = ''; } catch (e) { }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();