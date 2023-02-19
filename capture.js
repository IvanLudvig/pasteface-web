(() => {
    let width = 640;
    let height = 0;

    let streaming = false;

    let video = null;
    let canvas = null;
    let pasteButton = null;
    let output = null;
    let loader = null;

    const API_URL = 'https://pasteface.up.railway.app';

    function startup() {
        video = document.getElementById('video');
        width = video.getBoundingClientRect().width;
        canvas = document.getElementById('canvas');
        pasteButton = document.getElementById('pasteButton');
        output = document.getElementById('output');
        loader = document.getElementById('loader');

        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.log('Error: ' + err);
            });

        video.addEventListener('canplay', e => {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        });

        pasteButton.addEventListener('click', e => {
            takepicture();
            e.preventDefault();
        });

        window.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                pasteButton.click();
            }
        });
    }

    function takepicture() {
        let context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            let data = canvas.toDataURL();

            const showError = () => {
                if (output.textContent == '??') {
                    output.textContent = '???';
                } else if (output.textContent == '?') {
                    output.textContent = '??';
                } else {
                    output.textContent = '?';
                }
            }

            output.style.display = 'none';
            loader.style.display = 'block';
            pasteButton.disabled = true;
            fetch(`${API_URL}/analyze`, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: data })
            })
                .then(value => value.json())
                .then(data => {
                    if (data.result) {
                        output.textContent = data.result;
                    } else {
                        showError();
                    }
                })
                .catch(error => {
                    showError();
                })
                .finally(() => {
                    loader.style.display = 'none';
                    output.style.display = 'block';
                    pasteButton.disabled = false;
                });

        }
    }

    window.addEventListener('load', startup, false);
})();
