import datastore.client, pprint, json

url = "http://localhost:9200/esfera/discursos/"
client = datastore.client.DataStoreClient(url)

query = {
    "query" : {
        "match_all" : {  }
    },
    "facets" : {
        "partidos" : {
            "terms" : {
                "field" : "partido"
                }
            },
        "estados" : {
            "terms" : {
                "field" : "estado"
                }
            },
        "oradores" : {
            "terms" : {
                "field" : "orador"
                }
            }
        },
     
    "size" : 10
}

#working 
query = {
    "query" : {},
    "size":0,
    "from":0,
    "filter":[
        {"term":
            {"partido":"UDN"}
        }]
}

#concat filters?
query3 = {
    "query" : {
        "term" : { "partido" : "UDN" },
        
    },
    "size" :  10
}

#facets filter?
query = {   "size":10,
            "from":0,
            "facets":
                {"country":
                    {"terms":
                        {"field":"country"}
                    }
                },
            "filters":[{"term":{"country":"UK"}}]
        }

query = {
    "query" : {
        "filtered" : {
            "query" : {
                "match_all" : {}
            },
            "filter":[
                {"term":
                    {"partido":"UDN"}
                }]
            }
        },
    "facets" : {
        "estados" : {
            "terms" : {
                "field" : "estado"
                }
            },
        "partidos" : {
            "terms" : {
                "field" : "partido"
                }
            },
        "oradores" : {
            "terms" : {
                "field" : "orador"
                }
            }
        },
    "size" : 0
    }

query = {
    "query" : {
            "filtered" : {
                "query" : {
                    "match_all" : { }
                        },
                "filter" : [{
                    "match_all" : { }
                    }]
                }
                },
    "facets" : {
        "partidos" : {
            "terms" : {
                "field" : "partido",
                "size" : 30
                }
            },
        "estados" : {
            "terms" : {
                "field" : "estado",
                "size" : 30
                }
            },
        "oradores" : {
            "terms" : {
                "field" : "orador",
                "size" : 30
                }
            }
        },
    "size" : 100,
    "from" : 0
}


try:
    out = client.query(query)
    pprint.pprint(out)
except:
    print  "Error"
    print url + "_search?source=" + json.dumps(query)
