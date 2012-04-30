import datastore.client, pprint, json

url = "http://localhost:9200/esfera/discursos/"
client = datastore.client.DataStoreClient(url)

query = {
    "query" : {
        "match_all" : {}
        },
    "size":10,
    "from":0,
    "filter":[
        {"term":
            {"partido":"UDN"}
        }]
}

try:
    out = client.query(query)
    pprint.pprint(out)
except:
    print  "Error"
    print url + "_search?source=" + json.dumps(query)
