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
    "size":100,
    "from":0,
    "filter":[
        {"term":
            {"partido":"UDN"}
        }]
}

#concat filters?
query = {
    "size":10,
    "filter": 
        { "and" : [
            {"term":
                {"partido":"UDN"}
            },
            {"term":
                {"estado":"SP"}
            }
        ]}
}

#facets filter?
query = {   "size":100,
            "from":0,
            "facets":
                {"country":
                    {"terms":
                        {"field":"country"}
                    }
                },
            "filters":[{"term":{"country":"UK"}}]
        }

out = client.query(query)
pprint.pprint(out)
print url + "_search?source=" + json.dumps(query)
