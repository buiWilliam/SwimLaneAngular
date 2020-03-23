import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DiagramDataService {
  url = "http://54.224.222.23:7001/gojs/nodes"
  //gojs/nodes Get/Post Nodes
  //gojs/nodes/[key] Get node
  constructor(private http:HttpClient) { }
  
  retrieveAllNodes(){
    return this.http.get<JSON>(this.url)
  }

  postNode(node){
    return this.http.post(this.url,node)
  }

  retrieveNodeByKey(key){
    return this.http.get<JSON>(this.url+"/"+key)
  }

  
}
