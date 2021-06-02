window.addEventListener('load', (event) => {
    draw();
});

function draw() {
    const canvas = document.getElementById('tutorial');
    const context = canvas.getContext('2d');
    let id = 0;

    // When true, moving the mouse draws on the canvas
    let isDrawing = false;
    let x = 0;
    let y = 0;

    // event.offsetX, event.offsetY gives the (x,y) offset from the edge of the canvas.

    // Add the event listeners for mousedown, mousemove, and mouseup
    canvas.addEventListener('mousedown', e => {
        x = e.offsetX;
        y = e.offsetY;
        isDrawing = true;
    });

    canvas.addEventListener('mousemove', e => {
        if (isDrawing === true) {
            drawLine(context, x, y, e.offsetX, e.offsetY);
            x = e.offsetX;
            y = e.offsetY;

            console.log(x,"--",y);
        }
    });

    window.addEventListener('mouseup', e => {
        if (isDrawing === true) {
            drawLine(context, x, y, e.offsetX, e.offsetY);
            x = 0;
            y = 0;
            isDrawing = false;
        }
    });

    function drawLine(context, x1, y1, x2, y2) {
        context.beginPath();
        context.strokeStyle = 'black';
        context.lineWidth = 1;

        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }

    const fileSelector = document.getElementById('file-selector');
    fileSelector.addEventListener('change', (event) => {
        const fileList = event.target.files;
        
        function readImage(file) {
            // Check if the file is an image.
            if (file.type && !file.type.startsWith('image/')) {
                console.log('File is not an image.', file.type, file);
                return;
            }

            const reader = new FileReader();
            reader.addEventListener('load', (event) => {
                let galleryDiv = document.getElementById("gallery-div");
                if(galleryDiv.innerHTML.length !== 0)
                    galleryDiv.innerHTML += `<img height="100px" class="gallery-img" id = "img${id}">`;
                else
                    galleryDiv.innerHTML = `<img height="100px" class="gallery-img" id = "img${id}">`;

                var currImg = document.getElementById(`img${id}`);
                currImg.src = event.target.result;

                let allImgs = document.querySelectorAll(".gallery-img");
                allImgs.forEach(function(img){
                    img.addEventListener("click", function (e) {
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        context.drawImage(img, 0, 0);
                        
                    })
                })
                id++;
            });
            reader.readAsDataURL(file);
        }

        for(let i=0;i<fileList.length;i++)
            readImage(fileList[i]);
    });

}


