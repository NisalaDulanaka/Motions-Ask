
function MiddlewareTemplate(middlewareName){
    let template = 
    `<?php

    class ${middlewareName} extends Middleware{

        public function handleIncoming(Request $request){
            // Put your incoming logic here
            echo "This is a Middleware!<br><br>";

            return NEXT_ROUTE; // This will indicate the request to move to the next middleware or endpoint
        }

        public function handleOutgoing(Request $request){
            // Put your outgoing logic here
        }
    }`;

    return template;
}

module.exports = MiddlewareTemplate;