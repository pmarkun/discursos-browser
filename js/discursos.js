var base_url = "http://localhost:9200/esfera/discursos/_search?source=";

//roubado do acontecenacamara
function gup( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1].substring(0,results[1].length);
}

//roubado do recline
function normalizeQuery(queryObj) {
      var out = queryObj;
      if (out.q !== undefined && out.q.trim() === '') {
        delete out.q;
      }
      if (!out.q) {
        out.query = {
          match_all: {}
        };
      } else {
        out.query = {
          query_string: {
            query: out.q
          }
        };
        delete out.q;
      }
      // now do filters (note the *plural*)
      if (out.filters && out.filters.length) {
        if (!out.filter) {
          out.filter = {};
        }
        if (!out.filter.and) {
          out.filter.and = [];
        }
        out.filter.and = out.filter.and.concat(out.filters);
      }
      if (out.filters !== undefined) {
        delete out.filters;
      }
      return out;
    }

var query = {
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
    query.filters = []
    if (gup("estado")) {
        query.filters.push({ term : { "estado" : gup("estado") }});
        $("input#estado").val(gup("estado"));
    }
    if (gup("partido")) {
        query.filters.push({ term : { "partido" : gup("partido") }});
    }
    return normalizeQuery(query)
}

function carregaDiscursos(last, ultima_data) {
    query.from = last+query.size;
    query = carregaFiltros(query);
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
