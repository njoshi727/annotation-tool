window.addEventListener('load', (event) => {
    draw();
});

let addCategoryBtn = document.getElementById("category-push");
let color = "black";
let regionColor = 'rgba(0, 0, 200, 0.5)';

let jsonData = {
    "images": [],
    "annotations": [],
    "categories": []
};

let selectedRegion = null;

function draw() {
    let fileSelectorElement = document.getElementById("file-selector");
    let pencolorElement = document.getElementById("pencolor");
    let regioncolorElement = document.getElementById("regioncolor");

    let addFileBtn = document.querySelector(".fa-file-upload");
    let downloadBtn = document.querySelector(".fa-download");
    let strokeColorBtn = document.querySelector(".fa-pen");
    let regionColorBtn = document.querySelector(".fa-tint");
    let helpBtn = document.querySelector(".fa-question-circle");

    fileSelectorElement.style.visibility = "hidden";
    pencolorElement.style.visibility = "hidden";
    regioncolorElement.style.visibility = "hidden";

    addFileBtn.addEventListener("click",function(e){
        fileSelectorElement.click();
    })

    downloadBtn.addEventListener("click",function(){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "annotations" + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    })

    helpBtn.addEventListener("click",function(){
        var helperAnchorNode = document.createElement('a');
        helperAnchorNode.setAttribute("href","https://github.com/njoshi727/annotation-tool");
        helperAnchorNode.setAttribute("target", "_blank");
        helperAnchorNode.setAttribute("rel", "noopener noreferrer");
        helperAnchorNode.click();
        helperAnchorNode.remove();
    })

    pencolorElement.addEventListener("click",function(e){
        color = e.target.value;
    })

    regioncolorElement.addEventListener("click",function(e){
        regionColor = e.target.value;
    })

    strokeColorBtn.addEventListener("click",function(){
        pencolorElement.click();
    })

    regionColorBtn.addEventListener("click",function(){
        regioncolorElement.click();
    })

    const canvas = document.getElementById('tutorial');
    const context = canvas.getContext('2d');
    
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
            //left button is clicked and isDrawing is true , We are making boundary
            if(!selectedRegion){
                if(isDrawing){
                    drawLine(context,x,y,e.offsetX,e.offsetY);
                    x = e.offsetX;
                    y = e.offsetY;

                    pointList.push(x, y);
                    drawCircle(context, x, y);
                }
                else{
                    //We are selecting a region
                    let xClickPos = e.offsetX;
                    let yClickPos = e.offsetY;

                    let anntObj = getRegion(xClickPos,yClickPos);
                    let currImg = document.querySelector(".active-img");
                    let imgId = currImg.getAttribute("id").split("img")[1];

                    if(anntObj && Number(anntObj.image_id) == Number(imgId)){
                        console.log("I am here");
                        selectedRegion = anntObj;
                        colorMyRegion(context,anntObj.segmentation[0]);
                    }
                }
            }
            else{
                if(getRegion(e.offsetX,e.offsetY) === selectedRegion){
                    let img = document.querySelector(".active-img")
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.width = Math.max(1000,img.naturalWidth);
                    canvas.height = Math.max(img.naturalHeight);
                    context.drawImage(img, 0, 0);

                    drawUnColouredPolygon();
                    selectedRegion = null;
                }
            }
        }
    })

    let selectList = document.getElementById("category-select");
    selectList.addEventListener("change", function (e) {
        selectedRegion.category_id = e.currentTarget.value;
    })


    canvas.addEventListener('dblclick',function(e){
        if(!isDrawing){
            isDrawing = true;
            initialX = e.offsetX;
            initialY = e.offsetY;

            x = e.offsetX;
            y = e.offsetY;

            pointList.push(x, y);
            drawCircle(context, x, y);
        }
    })

    window.addEventListener('mousedown',function(e){
        if(selectedRegion == null){
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
        }
    })

    function drawCircle(context,x1,y1,r1=5){
        context.beginPath();
        context.strokeStyle = color;
        context.arc(x1, y1, r1, 0, 2 * Math.PI);
        context.fill();
    }

    function drawLine(context, x1, y1, x2, y2) {
        context.beginPath();
        context.strokeStyle = color;
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
            "segmentation" : [],
            "bbox" : bBox,
            "area" : area
        }

        anntObj.segmentation.push(pointList);
        jsonData.annotations.push(anntObj);
    }

    function getBoundingBox(pointList){
        let minX = Number(pointList[0]);
        let maxX = Number(pointList[0]);

        for(let i=2;i<pointList.length;i+=2){
            let point = Number(pointList[i]);
            if(Number(point) < Number(minX)){
                minX = point;
            }else if(Number(point) > Number(maxX)){
                maxX = point;
            }
        }

        let minY = Number(pointList[1]);
        let maxY = Number(pointList[1]);

        for (let i = 1; i < pointList.length; i+=2) {
            let point = Number(pointList[i]);
            if (Number(point) < Number(minY)) {
                minY = point;
            } else if (Number(point) > Number(maxY)) {
                maxY = point;
            }
        }

        let bBox = [minX,minY,maxX-minX,maxY-minY];
        return bBox;
    }

    function calculatePolygonArea(pointList){
        xCoordinateList = pointList.filter(function(elem,idx){
            return idx % 2 == 0 ;
        })

        yCoordinateList = pointList.filter(function(elem,idx){
            return idx % 2 == 1 ;
        })

        return calculatePolygonAreaHelper(xCoordinateList,yCoordinateList);
    }

    function calculatePolygonAreaHelper(xCoordinateList , yCoordinateList){
        let area = 0.0;

        // Calculate value of shoelace formula
        let j = xCoordinateList.length - 1;
        for (let i = 0; i < xCoordinateList.length; i++)
        {
            area += (xCoordinateList[j] + xCoordinateList[i]) * (yCoordinateList[j] - yCoordinateList[i]);
            // j is previous vertex to i
            j = i;
        }

        // Return absolute value
        return Math.abs(area / 2.0);
    }

    function getRegion(xpos , ypos){
        // If xpos and ypos is inside bBox of Polygon , It will return that Polygon
        let annotationArray = jsonData.annotations;
        for(let i=0;i<annotationArray.length;i++){
            let currbBox = annotationArray[i].bbox;
            let currImg = document.querySelector(".active-img");
            let imgId = currImg.getAttribute("id").split("img")[1];

            if(isPointInsideBbox(currbBox,xpos,ypos) && Number(annotationArray[i].image_id)=== Number(imgId)){
                return annotationArray[i];
            }
        }
        return null;

        function isPointInsideBbox(bBox , xpos , ypos){
            let [lowerX,lowerY,rangeX,rangeY] = bBox;
            if(xpos >= lowerX && xpos <= lowerX+rangeX 
                && ypos >= lowerY && ypos <= lowerY+rangeY){
                return true;
            }

            return false;
        }
    }

    function colorMyRegion(context,pointsArray){
        context.beginPath();
        context.fillStyle = regionColor;
        context.moveTo(pointsArray[0],pointsArray[1]);

        for(let i=2;i<pointsArray.length;i+=2){
            let xpoint = pointsArray[i];
            let ypoint = pointsArray[i+1];

            context.lineTo(xpoint,ypoint);
        }
        context.fill();
    }

    function drawUnColouredPolygon(){
        let annotationArray = jsonData.annotations;
        let currImg = document.querySelector(".active-img");

        let imgId = Number(currImg.getAttribute("id").split("img")[1]);

        for(let i=0;i<annotationArray.length;i++){
            let anntObj = annotationArray[i];
            if(Number(anntObj.image_id) === imgId){
                let pointsArray = anntObj.segmentation[0];

                for(let i=0;i<pointsArray.length-2;i+=2){
                    drawLine(context,pointsArray[i],pointsArray[i+1],pointsArray[i+2],pointsArray[i+3]);
                    drawCircle(context,pointsArray[i],pointsArray[i+1]);
                }

                drawCircle(context,pointsArray[pointsArray.length-2],pointsArray[pointsArray.length-1]);
                drawLine(context,pointsArray[0],pointsArray[1],pointsArray[pointsArray.length-2],pointsArray[pointsArray.length-1]);
            }
        }
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
                currImg.onload = function () {
                    let imgObj = {
                        "id": Number(currImg.getAttribute("id").split("img")[1]),
                        "width": currImg.naturalWidth,
                        "height": currImg.naturalHeight,
                        "file_name": file.name
                    };
                    jsonData.images.push(imgObj);
                }
        
                let allImgs = document.querySelectorAll(".gallery-img");
                allImgs.forEach(function(img){
                    img.addEventListener("click", function (e) {
                        
                        /*Set Selected Image on Canvas and resize canvas
                        acc to selected img
                        */
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        canvas.width = Math.max(1000,img.naturalWidth);
                        canvas.height = Math.max(1000,img.naturalHeight);
                        context.drawImage(img, 0, 0);
                        
                        // Handling Active Class on image gallery!
                        allImgs.forEach(function(img){
                            img.classList.remove("active-img");
                        })
                        img.classList.add("active-img");
                        let imgObj = null;
                        let imgId = img.getAttribute("id");
                        imgId = Number(imgId.split("img")[1]);

                        for(let i = 0; i < jsonData.images.length ; i++){
                            let currImgObj = jsonData.images[i];
            
                            if(Number(currImgObj.id) == imgId)
                            {
                                imgObj = currImgObj;
                                break;
                            }
                        }

                        setSelectedImageDetails(imgObj);
                        drawUnColouredPolygon();
                        selectedRegion = null;
                        isDrawing = false;
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

function setSelectedImageDetails(imgObj){
    let nameField = document.getElementById("selectImageName");
    let idFeild = document.getElementById("selectImageId");
    let heightField = document.getElementById("selectImageHeight");
    let widthField = document.getElementById("selectImageWidth");

    nameField.value = imgObj.file_name;
    idFeild.value = imgObj.id;
    heightField.value = Number(imgObj.height);
    widthField.value = imgObj.width;

}

addCategoryBtn.addEventListener("click",function(e){
    let addCategoryBox = document.getElementById("inputCategoryField");
    let categoryListElement = document.getElementById("category-select");

    let categoryName = addCategoryBox.value.trim();
    if (categoryName.length != 0){
        if (!isCategoryPresent(categoryName,categoryListElement)){
            //Category needs to be added
            var opt = document.createElement('option');
            opt.value = categoryListElement.length-1;
            opt.innerHTML = categoryName;
            opt.id = categoryListElement.length-1;

            let catObj = {
                id : opt.id,
                name : opt.innerHTML
            }

            jsonData.categories.push(catObj);
            categoryListElement.appendChild(opt);

            alert(`${categoryName} Added !`)
        }
        else{
            alert("Sorry ! Category Already Present !");
            return;
        }
    }

    function isCategoryPresent(categoryName , categoryListElement){
        let isPresent = false;
        Array.from(categoryListElement).forEach(function(category){
            if(category.value.trim() == categoryName){
                isPresent = true;
            }
        })

        return isPresent;
    }
})

