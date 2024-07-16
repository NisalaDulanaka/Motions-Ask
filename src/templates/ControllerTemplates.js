
function ControllerTemplate(controllerName){
    let template = 
    `<?php

    class ${controllerName} extends Controller{

        public function index(Request $request){
            // Write your logic here
            echo "This is the main endpoint";
        }
        
    }`;

    return template;
}

module.exports = ControllerTemplate;