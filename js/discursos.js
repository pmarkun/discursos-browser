my = {};
my.base_url = "http://localhost:9200/esfera/discursos";

my.query = {
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
            },
        "data" : {
            "terms" : {
                "field" : "data",
                "size" : 5000,
                "order" : "term"
                }
            }
        },
    "size" : 100,
    "from" : 0,
    "sort" : {
        "data" : { "order" : "asc" }
    }
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
    var result = results[1].substring(0,results[1].length);
    return decodeURIComponent(result).replace(/\+/g, " ")
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


function montaUrl(url, q) {
   return url + '/_search?source=' + JSON.stringify(q) //Jquery tem um metodo pra isso?
}

//chupinhado do site da camara
function integraUrl(publicacao_colecao,publicacao_pagina,publicacao_data) {
        var col = null;
        if (publicacao_colecao == 'DCD') {
            col = "D";
        }
        if (publicacao_colecao == 'DCNR') {
            col = "R";
        }
        if (publicacao_colecao == 'DCN') {
            col = "J";
        }
        if (publicacao_colecao == 'DANC') {
            col = "R";
        }
        if (publicacao_colecao == 'ANA') {
            col = "A";
        }
        
        if (col) {
        return 'http://imagem.camara.gov.br/dc_20.asp?selCodColecaoCsv=' + col + '&txPagina=' + publicacao_pagina + '&Datain=' + publicacao_data;
        }
        else {
            return '';
        }
}

//temporario - modificar
function carregaFiltros(q) {
    var filters = []
    
    if (gup("estado")) {
        filters.push({ term : { "estado" : gup("estado") }});
        $("input#estado").val(gup("estado"));
    }
    
    if (gup("partido")) {
        filters.push({ term : { "partido" : gup("partido") }});
        $("input#partido").val(gup("partido"));
    }
    
    if (gup("orador")) {
        filters.push({ term : { "orador" : gup("orador") }});
        $("input#orador").val(gup("orador"));
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
        $("input#data_inicio").val(gup("data_inicio").replace(/%2F/g,"/"));
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
        $("input#data_fim").val(gup("data_fim").replace(/%2F/g,"/"));
    }
    
    if (filters.length >= 1) {
        q.query.filtered.filter = normalizeFilters(filters);
    }
    
    if (gup("texto")) {
        q.query.filtered.query = {
            "text" : {
                "sumario" : gup("texto")
            }
        }
        $("input#texto").val(gup("texto"));
    }
    return q
}


function rockndroll(q) {
    url = montaUrl(my.base_url, q);
    $.getJSON(url, function(data) {
        carregaDados(data);
    });
    return 'ok'
}

function carregaDados(data) {
        my.dados = data;
        carregaTabela('partidos');
        carregaTabela('estados');
        carregaTabela('oradores');
        carregaTimeline();
        $("#data_inicio").datepicker({ dateFormat: "dd/mm/yy" });
        $("#data_fim").datepicker({ dateFormat: "dd/mm/yy" });
        var ultima_data = '';
        ultima_data = carregaDiscursos(0, ultima_data, my.query);
}

function carregaDiscursos(last, ultima_data) {
    if (last != 0) {
        my.query.from = last+my.query.size;
    }
    url = montaUrl(my.base_url, my.query);
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
    $.each(my.dados.facets[tabela].terms, function(key, data) {
            data.class = 'linha';
            $('#'+tabela+ ' table').append(ich.rowtmpl(data));
            });
    $('#'+tabela+ ' table').append(ich.rowtmpl({"term" : "Total", "count" : my.dados.facets[tabela].total, 'class' : 'total'}));
}

function showTooltip(x, y, contents) {
    $('<div id="tooltip">' + contents + '</div>').css( {
        position: 'absolute',
        display: 'none',
        top: y + 5,
        left: x + 5,
        border: '1px solid #D5EFFF',
        padding: '2px',
        'background-color': '#E1F3FA',
        opacity: 0.80
    }).appendTo("body").fadeIn(200);

}

function carregaTimeline() {
        var data = my.dados;
        var d = [];
        
        $.each(data.facets.data.terms, function(key, data) {
        d.push([data.term, data.count]);
        });
        
        $.plot($("#timeline"), [d], 
            { 
                xaxis: { mode: "time", },
                series: { lines: { show: true }, points: { show: false } },
                grid: { hoverable: true, clickable: true, backgroundColor: "#E7EBD7" }
             });
     
    var previousPoint = null;
    $("#timeline").bind("plothover", function (event, pos, item) {
        if (item) {
            if (previousPoint != item.dataIndex) {
                previousPoint = item.dataIndex;
                $("#tooltip").remove();
                showTooltip(item.pageX, item.pageY, new Date(item.datapoint[0]).toDateString() + '\n' + item.datapoint[1] + ' discursos');
            }
        }
        else {
            $("#tooltip").remove();
            previousPoint = null;
            }
    });

    $("#timeline").bind("plotclick", function (event, pos, item) {
        if (item) {
            var d = new Date(item.datapoint[0]);
            var curr_date = d.getDate()+'';
            if (curr_date < 9) { curr_date = '0' + curr_date; }
            var curr_month = d.getMonth()+1; //month contado a partir do 0
            if (curr_month < 9) { curr_month = '0' + curr_month; }
            var curr_year = d.getFullYear();
            var item_date = curr_date + "-" + curr_month + "-" + curr_year;
            $('html, body').animate({
                            scrollTop: $("#" + item_date).offset().top
                        }, 500);
        }
    });
     
}


function insertTags(tags, id) {
    //authenticate?
    //load object through id
    //add tags
    //upload back to elasticsearch
    //reload object on page?
}
