(() => {
    let width = 640;
    let height = 0;

    let streaming = false;

    let video = null;
    let canvas = null;
    let startbutton = null;
    let output = null;

    const API_URL = 'https://pasteface.up.railway.app';

    function startup() {
        video = document.getElementById('video');
        width = video.getBoundingClientRect().width;
        canvas = document.getElementById('canvas');
        startbutton = document.getElementById('startbutton');
        output = document.getElementById('output');

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

        startbutton.addEventListener('click', e => {
            takepicture();
            e.preventDefault();
        });

        window.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                startbutton.click();
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

            fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: data })
            })
                .then(value => value.json())
                .then(data => {
                    output.textContent = data.result || '?';
                })
                .catch(error => {
                    output.textContent = '?';
                });

        } else {
            clearphoto();
        }
    }

    window.addEventListener('load', startup, false);
})();
