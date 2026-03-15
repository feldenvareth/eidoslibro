$(document).ready(function(){



    //mobile menu toggling
    $("#menu_icon").click(function(){
        $("header nav ul").toggleClass("show_menu");
        $("#menu_icon").toggleClass("close_menu");
        return false;
    });

    

    //Contact Page Map Centering
    var hw = $('header').width() + 50;
    var mw = $('#map').width();
    var wh = $(window).height();
    var ww = $(window).width();

    $('#map').css({
        "max-width" : mw,
        "height" : wh
    });

    if(ww>1100){
         $('#map').css({
            "margin-left" : hw
        });
    }

   



    //Tooltip
    $("a").mouseover(function(){

        var attr_title = $(this).attr("data-title");

        if( attr_title == undefined || attr_title == "") return false;
        
        $(this).after('<span class="tooltip"></span>');

        var tooltip = $(".tooltip");
        tooltip.append($(this).data('title'));

         
        var tipwidth = tooltip.outerWidth();
        var a_width = $(this).width();
        var a_hegiht = $(this).height() + 3 + 4;

        //if the tooltip width is smaller than the a/link/parent width
        if(tipwidth < a_width){
            tipwidth = a_width;
            $('.tooltip').outerWidth(tipwidth);
        }

        var tipwidth = '-' + (tipwidth - a_width)/2;
        $('.tooltip').css({
            'left' : tipwidth + 'px',
            'bottom' : a_hegiht + 'px'
        }).stop().animate({
            opacity : 1
        }, 200);
       

    });

    $("a").mouseout(function(){
        var tooltip = $(".tooltip");       
        tooltip.remove();
    });


});

    document.addEventListener("DOMContentLoaded", function() {
        var elements = document.querySelectorAll(".primeramayuscula");
        var excludeWords = ["y", "o"]; // Lista de conjunciones que no se capitalizan
        var prepositions = ["a", "de", "en", "con", "por", "para"]; // Lista de preposiciones

        // Función para procesar sólo nodos de texto sin afectar el HTML
        function capitalizeTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                var text = node.textContent;

                node.textContent = text.replace(/(^|\s|[¿¡:])([a-záéíóúüñ]+)/g, function(match, separator, word) {
                    // No modificar si la palabra original está en mayúsculas
                    if (word === word.toUpperCase()) {
                        return match;
                    }

                    // No cambiar si es conjunción o palabra de 2 letras
                    if (excludeWords.includes(word.toLowerCase()) || word.length <= 2) {
                        return separator + word;
                    }

                    // Capitalizar preposiciones solo si están al inicio de la frase
                    if (separator.trim() === "" && prepositions.includes(word.toLowerCase())) {
                        return separator + word.charAt(0).toUpperCase() + word.slice(1);
                    }

                    // Capitalizar la primera letra de la palabra normalmente
                    return separator + word.charAt(0).toUpperCase() + word.slice(1);
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Recorrer los nodos hijos sin modificar etiquetas HTML
                node.childNodes.forEach(capitalizeTextNodes);
            }
        }

        // Recorrer todos los elementos con la clase "primeramayuscula"
        elements.forEach(function(element) {
            element.childNodes.forEach(capitalizeTextNodes);
        });
    });