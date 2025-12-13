class APiREsponse {

    constructor(message="Success",data,statusCode){
        this.message=message;
        this.statusCode=statusCode,
        this.data=data;
        this.success=statusCode<400
    }
}

export {APiREsponse}