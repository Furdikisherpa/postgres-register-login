export const testmiddleware = (req, res, next) =>{
    console.log("The request arrived at this middleware");
    next();
}