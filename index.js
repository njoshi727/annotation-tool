window.addEventListener('load', (event) => {
    draw();
});

function draw() {
    const canvas = document.getElementById('tutorial');
    const context = canvas.getContext('2d');
    let jsonData = {
        "images" : [],
        "annotations" : [],
        "categories" : [] 
    };
    let id = 0;

    // When true, moving the mouse draws on the canvas
    let isDrawing = false;
    let initialX , initialY;
    let pointList = [];
    let x ;
    let y ;

    // event.offsetX, event.offsetY gives the (x,y) offset from the edge of the canvas.

    // Add the event listeners for mousedown, mousemove, and mouseup
   
    canvas.addEventListener('mousedown',function(e){
        if(e.button == 0){
            //left button is clicked
            if(!isDrawing){
                isDrawing = true;
                initialX = e.offsetX;
                initialY = e.offsetY;   
            }else{
                drawLine(context,x,y,e.offsetX,e.offsetY);
            }
            x = e.offsetX;
            y = e.offsetY;

            pointList.push(x,y);
            drawCircle(context,x,y);
        }
    })

    window.addEventListener('mousedown',function(e){
        if(e.button == 2){
            if(isDrawing){
                isDrawing = false;
                drawLine(context, x, y, e.offsetX, e.offsetY);
                drawLine(context,initialX,initialY,e.offsetX,e.offsetY);
                drawCircle(context,e.offsetX,e.offsetY);

                pointList.push(e.offsetX,e.offsetY);
                handleJSON(pointList);
                initialX = undefined ;
                initialY = undefined ;
                x = undefined ;
                y = undefined
                pointList = [];
            }
        }
    })

    function drawCircle(context,x1,y1,r1=5){
        context.beginPath();
        context.arc(x1, y1, r1, 0, 2 * Math.PI);
        context.fill();
    }

    function drawLine(context, x1, y1, x2, y2) {
        context.beginPath();
        context.strokeStyle = 'black';
        context.lineWidth = 1;

        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }

    function handleJSON(pointList){
        let activeImg = document.querySelector(".active-img");
        let imgId = Number(activeImg.getAttribute("id").split("img")[1]);
        let bBox = getBoundingBox(pointList);
        let area = calculatePolygonArea(pointList);

        let anntObj = {
            "id" : jsonData.annotations.length,
            "iscrowd" : 0,
            "image_id" : imgId,
            "category_id" : undefined,
            "segmentation" : [pointList],
            "bbox" : bBox,
            "area" : area
        }

        jsonData.annotations.push(anntObj);
    }

    function getBoundingBox(pointList){

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
                //To Store in JSON File
                currImg.src = event.target.result;
                let imgObj = {
                    "id": id,
                    "width": currImg.naturalWidth,
                    "height": currImg.naturalHeight,
                    "file_name": file.name
                };
                jsonData.images.push(imgObj);
                
                let allImgs = document.querySelectorAll(".gallery-img");
                allImgs.forEach(function(img){
                    img.addEventListener("click", function (e) {
                        
                        /*Set Selected Image on Canvas and resize canvas
                        acc to selected img
                        */
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        context.drawImage(img, 0, 0);
                        
                        // Handling Active Class on image gallery!
                        allImgs.forEach(function(img){
                            img.classList.remove("active-img");
                        })
                        img.classList.add("active-img");
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


