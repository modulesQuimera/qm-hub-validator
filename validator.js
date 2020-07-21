module.exports = function(RED) {

    "use strict";
    function validatorNode(config) {
        RED.nodes.createNode(this, config);
        this.validate_stepNumber = true;
        this.validate_positionModule = true;
        var node = this;

        node.on('input', function(msg, send, done) {
            node.validate_stepNumber = true;
            node.validate_positionModule = true;
            var globalContext = node.context().global;
            var file = globalContext.get("exportFile");
            var step_list = [];
            var duplicated_numbers = new Set();
            var repeated_numbers = [];

            for(var i=0; i<4; i++){
                for(var j=0; j<file.slots[i].jig_test.length; j++){
                    if(file.slots[i].jig_test[j].method === "display_step"){
                        step_list.push(file.slots[i].jig_test[j].step_number);
                    }
                    console.log(file.slots[i].jig_test[j])
                    if(file.slots[i].jig_test[j].method === "get_command_message" || file.slots[i].jig_test[j].method === "format_message"){
                        var posAnt = j - 1; 
                        if(posAnt>=0){
                            if(file.slots[i].jig_test[posAnt].method != "send_receive"){
                                node.validate_positionModule = false;
                            }
                        }
                    }
                }
            }   
            console.log(step_list);
            for(var i=0; i<step_list.length; i++){
                var x = step_list[i];
                for(var j=0; j<step_list.length; j++){
                    var y = step_list[j];
                    if((x === y) && (i != j)){
                        duplicated_numbers.add(x);
                        node.validate_stepNumber = false;
                    }
                }
            }  
            for (var item of duplicated_numbers){
                repeated_numbers.push(item);
            }
            if (node.validate_stepNumber && node.validate_positionModule) {
                console.log("Valid test generated");
                send(msg);
            }
            else{
                if(!node.validate_stepNumber){
                    console.log("INVALID TEST\n\nRepeated step_number: ", repeated_numbers);
                    node.error("INVALID TEST\n\nRepeated values for step_number: " + JSON.stringify(repeated_numbers));
                }
                if(!node.validate_positionModule){
                    console.log("INVALID TEST\n\nModules 'get_command_message' and 'format_message' needs a 'send-receive' module before each");
                    node.error("INVALID TEST\n\nModules 'get_command_message' and 'format_message' needs a 'send-receive' module before each");
                }
            }
        });

    }
    RED.nodes.registerType("validator", validatorNode);
};