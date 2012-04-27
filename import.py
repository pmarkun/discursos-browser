import datastore.client
import csv, os

#Define elasticsearch database
url = "http://localhost:9200/esfera/discursos/"
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
    

upload(client, "data/discursos.csv");
