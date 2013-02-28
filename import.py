import datastore.client
import csv, os

#Define elasticsearch database
#url = "http://127.0.0.1:9200/esfera/discursos/"
url = "http://66.228.59.236:9200/revanche/brado/"
client = datastore.client.DataStoreClient(url)


def funkystuff(reader):
    for row in reader:
        #dofunkystuff
        yield row
        
def upload(client, fp, encoding=None, delimiter=','):
    
    if encoding:
        os.system("iconv -f "+ encoding + " -t utf-8 " + fp + " --output utf8-" + fp)
        fo = open("utf8-"+fp)
    else:
        fo = open(fp)
    reader = csv.DictReader(fo, delimiter=delimiter)
    
    if (FIRST_TIME):
        try:
            client.delete()
            print "Delete done"
            
            client.mapping_update(
            { "properties" :
                { "orador" : 
                    { "type" : "string", "index" : "not_analyzed" },
                 "partido" :
                    { "type" : "string", "index" : "not_analyzed" },
                "estado" :
                    { "type" : "string", "index" : "not_analyzed" },
                "data" :
                    { "type" : "date", "format" : "dd/MM/YYYY" }
                } 
            })
            print 'Mapping done'
            
        except "HTTP Error 404":
            print "Creating new database"

    print "Inserting rows"
    client.upsert(funkystuff(reader))
    
FIRST_TIME = False
upload(client, "data/discursos.csv");
