import axios from "axios"

export default ({req}) =>{

  if(typeof window === "undefined"){
     //we are on the server
    //request should be made to http://servicename.namespace.svc.cluster.local
    //ingress-nginx-controller --service
    //ingress-nginx --namespace
    return axios.create({
      baseURL:  "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers
    })
}else{
  //we are on the browser
    //request can be made with a  base url "/api/users/curentuser"
    console.log("client")
  return axios.create({
    baseURL:  "/"
  })
}
}