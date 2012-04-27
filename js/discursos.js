var base_url = "http://localhost:9200/esfera/discursos/_search?source=";

var query = {
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
};

//roubado do acontecenacamara
function gup( name ) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1].substring(0,results[1].length);
}

//roubado e adaptado do recline
function normalizeFilters(filters) {
    var filter = {}
    if (filters && filters.length) {
        if (!filter) {
            filter = {};
        }
        if (!filter.and) {
            filter.and = [];
        }
        filter.and = filter.and.concat(filters);
    }
    if (filters !== undefined) {
        delete filters;
    }
    return filter;
}


function montaUrl(base, query) {
   return base + JSON.stringify(query) //Jquery tem um metodo pra isso?
}

function integraUrl(publicacao_colecao,publicacao_pagina,publicacao_data) {
        if (publicacao_colecao == 'DCD') {
            return 'http://imagem.camara.gov.br/dc_20.asp?selCodColecaoCsv=' + 'D&txPagina=' + publicacao_pagina + '&Datain=' + publicacao_data;
        }
        else {
            return 'notyet';
        }
}

//temporario - modificar
function carregaFiltros(query) {
    var filters = []
    
    if (gup("estado")) {
        filters.push({ term : { "estado" : gup("estado") }});
        $("input#estado").val(gup("estado"));
    }
    
    if (gup("partido")) {
        filters.push({ term : { "partido" : gup("partido") }});
        $("input#partido").val(gup("partido"));
    }
    
    if (gup("data_inicio")) {
        var data_inicio_filter = {
            "range" : {
                "data" : {
                    "from" : gup("data_inicio")
                        }
                    }
                }
        filters.push(data_inicio_filter);
        $("input#data_inicio").val(gup("data_inicio"));
    }
    
    if (gup("data_fim")) {
        var data_fim_filter = {
            "range" : {
                "data" : {
                    "to" : gup("data_fim")
                        }
                    }
                }
        filters.push(data_fim_filter);
        $("input#data_fim").val(gup("data_fim"));
    }
    if (filters.length >= 1) {
        query.query.filtered.filter = normalizeFilters(filters);
    }
    return query
}

function carregaDiscursos(last, ultima_data) {
    if (query.from != 0) {
        query.from = last+query.size;
    }
    url = montaUrl(base_url, query);
    $.getJSON(url, function(discursos_data) {
    $.each(discursos_data.hits.hits, function(key, data) {
            if (ultima_data != data._source.data) {
                ultima_data = data._source.data;
                $('#discursos').append('<h3 class="date">' + data._source.data+ '</h3>');
            }
            
            data._source['url'] = integraUrl(data._source.publicacao_colecao, data._source.publicacao_pagina,data._source.publicacao_data);
            $('#discursos').append(ich.discursostmpl(data._source));
        });
    var last = $(".discurso").size()
    if (last < discursos_data.hits.total) {
            if ($('#loadmore')) {
                $('#loadmore').remove()
            }
            ultima_data = '"'+ultima_data+'"';
            $('#discursos').append("<button id='loadmore' class='btn' onClick='carregaDiscursos("+last+", "+ultima_data+")'>load more</button>");
        }
    });
    return ultima_data;
}

function carregaTabela(tabela) {
    url = montaUrl(base_url, query);
    $.getJSON(url, function(discursos_data) {
    $.each(discursos_data.facets[tabela].terms, function(key, data) {
            $('#'+tabela+ ' table').append(ich.rowtmpl(data));
            }); 
        });
}
