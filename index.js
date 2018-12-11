'use strict';

var restify = require('restify');
const bodyParser = require('body-parser');
const http = require('https');
var unirest = require('unirest');
const {Card, Suggestion} = require('dialogflow-fulfillment');
var md = require('markdown');

var port = process.env.PORT || 8080;

var server = restify.createServer();

server.use(bodyParser.json());


try{
    server.post('/getMusic', function (request,response) {
        var bodyContent = request.body;
        var intent = bodyContent.queryResult.intent["displayName"];

        switch(intent){
            case 'Listen':
                if(bodyContent.queryResult.parameters["any"]){
                    
                    var song = bodyContent.queryResult.parameters["any"];
                    var artist = bodyContent.queryResult.parameters["artist"];
                    var req = unirest("GET", "https://api.spotify.com/v1/search?q=track:"+song+"%20"+artist+"&type=track&market=US");

                   
               //     var location = bodyContent.queryResult.parameters["any"];

                    req.header({'Content-Type':'application/json'});
                    req.header({'Authorization':'Bearer BQCoPq-DGR2QF0gxxDyn3_hwr6qw2HhlhO7jtCJ_vIgqVyoLhAqZHtbUjfe1uvmZH4cRk6I3joxg4oX1DslKUtoqmDBeAO2_zX6UmJsN8zRJPTEyuRS1DOvGoefuO1dJA7Kui4trdOcYNWcuDKqw_KUC9zw0vGKPXg'})
                /*    req.query({
                        "q": "track:"+song+"%20"+artist,
                        "type": "track"
                    });*/

               //     req.send("{}"); //error the body
                    console.log(req);
                    req.end(function(res) {
                        if(res.error) {
                            response.setHeader('Content-Type', 'application/json');
                            var pass = {
                                        fulfillmentText: 'Sorry, something went wrong'
                                    }            
                            response.send(pass);
                        }else if(res.body.tracks.items.length == 0){
                            response.setHeader('Content-Type', 'application/json');
                            var pass = {
                                        fulfillmentText: 'Sorry, unable to find something for your request. Please try again'
                                    }            
                            response.send(pass);
                        }else if(res.body.tracks.items.length > 0) {

                           // let track = res.body.tracks.items[0];
                        //    let externalLink = track.album.artists[0].external_urls["spotify"];
                        //    let contentUrl = "";// track["preview_url"];
                           
                            for(let x = 0 ;x < res.body.tracks.items.length; x++){
                               
                                if(res.body.tracks.items[x]["preview_url"]!=null){

                                    let track = res.body.tracks.items[x];
                                    let contentUrl = track["preview_url"];
                                      // only preview
                                    let icon = track.album.images[0]["url"];
                                    let res_artist = track.album.artists[0]["name"];
                                    let album = track.album["name"];
                                    let track_name = track["name"]

                                    response.setHeader('Content-Type', 'application/json', 'charset=utf-16');
                                    var pass = {
                                        "payload": {
                                            "google": {
                                              "expectUserResponse": true,
                                              "richResponse": {
                                                "items": [
                                                  {
                                                    "simpleResponse": {
                                                      "textToSpeech": "Now playing : "
                                                    }
                                                  },
                                                  {
                                                    "mediaResponse": {
                                                      "mediaType": "AUDIO",
                                                      "mediaObjects": [
                                                        {
                                                          "contentUrl": contentUrl,
                                                          "description": "Artist : "+res_artist +"   Album : "+album,
                                                          "icon": {
                                                            "url": icon,
                                                            "accessibilityText": "Ocean view"
                                                          },
                                                          "name": track_name
                                                        }
                                                      ]
                                                    }
                                                  }
                                                ],
                                                "suggestions": [
                                                  {
                                                    "title": "Cancel"
                                                  }
                                                ]
                                              }
                                            }
                                          },
                                          "fulfillmentMessages": [
                                            {
                                              "text": {
                                                "text": [
                                                  "Found it! Your search preferrences: "+artist+" & "+song
                                                ]
                                              }
                                            }
                                          ]
                                    }

                                  response.send(pass); 
                                    break;
                                }
                            }
                            

                           
                        /*   
                            var pass = {
                                
                                "payload": {
                                    "google": {
                                      "expectUserResponse": true,
                                      "richResponse": {
                                        "items": [
                                          {
                                            "simpleResponse": {
                                              "textToSpeech": "Found It! : "
                                            }
                                          },
                                          {
                                            "basicCard": {
                                              "title": song, // song title
                                              "subtitle": "preferred artist : "+artist, // singer
                                              "formattedText": "<b>Spotify</b> is a new digital music service that enables users to remotely source millions of different songs on various record labels from a laptop, smartphone or other device.",
                                              "image": {
                                                "url": "https://firebasestorage.googleapis.com/v0/b/music-6643e.appspot.com/o/512.png?alt=media&token=9c463039-24c6-4947-8dcf-5a25d0628856",
                                                "accessibilityText": "open.spotify.com"
                                              },
                                              "buttons": [
                                                {
                                                  "title": "Open", // open
                                                  "openUrlAction": {
                                                    "url": externalLink //url 
                                                  }
                                                }
                                              ],
                                              "imageDisplayOptions": "CROPPED"
                                            }
                                          }
                                        ]
                                      }
                                    }
                                  },"fulfillmentMessages": [
                                    {
                                      "text": {
                                        "text": [
                                          externalLink
                                        ]
                                      }
                                    }
                                  ]
                            }
   
*/
                            
                        }
                    });

                  }      
                  break;
        }
    });

}catch(err){
    console.log(err);
}

server.get('/try', function (req,res){
    res.send('Hello world');
})

server.listen(port, function() {
   console.log('Now connected to PORT');
})