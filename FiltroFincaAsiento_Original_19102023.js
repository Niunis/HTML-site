var Busqueda = {
    Persona: {},
    DatoInteresado: {},
    ObjetoJson: {},
    DataCertificadoConsulta: {},
    arrPersonas: [],
    Autenticacion: {},
    organizacion: '',
    OrganizacionActual: {},
    IdTransaccion:'',
    NumeroTransacion: '',
    Servicio: {},
    CodigoInternoCertificado: 'CNI',
    EstadoFinca: [],
    arregloPersonaJuridica :[],
    tipoAlerta: {
        Success: { clase: 'alerta-satisfactorio' }
        , Warning: { clase: 'alerta-advertencia' }
        , Delete: { clase: 'alerta-error' }
    },
    arrayBuzonFincas: [],
    valorSeleccionado: '0',
    SeleccionRegistro: '0',
    SeleccionPersonaJuridica: '0',
    events: {
        "change select#cbo-tipo-busqueda": "toggle_Busqueda"
        , "change select#cbo-registro": "toogle_Registro"
        //, "change select#cbo-personaJuridica": "toogle_PersonaJuridica"
        , "click button#btn-buscar": "BuscarInteresados_Finca"
        , "click button#btnAceptarCni": "ConfirmarCertificadoNegativa"
        , "click button#btnCancelarCni": "CancelarCertificadoNegativa"
    },
    ListaDepartamentos: [{ "IdOrganizacion": 270, "CodigoInterno": "ENT-2114438431", "Organizacion": "REGISTRO PUBLICO DE LA PROPIEDAD INMUEBLE Y MERCANTIL MANAGUA", "Departamento": "MANAGUA", "IdDepartamento": 110 }, { "IdOrganizacion": 556, "CodigoInterno": "ENT-2017", "Organizacion": "REGISTRO PUBLICO DE LA PROPIEDAD INMUEBLE Y MERCANTIL ESTELI", "Departamento": "ESTELI", "IdDepartamento": 105 }, { "IdOrganizacion": 558, "CodigoInterno": "ENT-3654789513", "Organizacion": "REGISTRO PUBLICO DE LA PROPIEDAD INMUEBLE Y MERCANTIL JINOTEGA", "Departamento": "JINOTEGA", "IdDepartamento": 107 }, { "IdOrganizacion": 585, "CodigoInterno": "ENT-2020", "Organizacion": "REGISTRO PUBLICO DE LA PROPIEDAD INMUEBLE Y MERCANTIL LEON", "Departamento": "LEON", "IdDepartamento": 108 }, { "IdOrganizacion": 586, "CodigoInterno": "ENT-2021", "Organizacion": "REGISTRO PUBLICO DE LA PROPIEDAD INMUEBLE Y MERCANTIL MASAYA", "Departamento": "MASAYA", "IdDepartamento": 111 }, { "IdOrganizacion": 587, "CodigoInterno": "ENT-00005", "Organizacion": "REGISTRO PUBLICO DE LA PROPIEDAD INMUEBLE Y MERCANTIL NUEVA SEGOVIA", "Departamento": "NUEVA SEGOVIA", "IdDepartamento": 113 }, { "IdOrganizacion": 588, "CodigoInterno": "ENT-00020", "Organizacion": "REGISTRO PUBLICO DE LA PROPIEDAD INMUEBLE Y MERCANTIL MADRIZ", "Departamento": "MADRIZ", "IdDepartamento": 109 }, { "IdOrganizacion": 592, "CodigoInterno": "ENT-00075", "Organizacion": "REGISTRO PUBLICO DE LA PROPIEDAD INMUEBLE Y MERCANTIL CARAZO", "Departamento": "CARAZO", "IdDepartamento": 102 }],
    Init: function () {
        //debugger;
        self = this;
        Object.keys(self.events).forEach(function (e) {
            $(e.split(' ')[1]).bind(e.split(' ')[0], self[self.events[e]]);
        });
        if (localStorage['JsonAuth']) {
            Busqueda.Autenticacion = JSON.parse(localStorage.JsonAuth);
            Busqueda.Autenticacion.organizaciones = this.ListaDepartamentos;
        }
        Busqueda.llenarSelect();

    },
    //*****METODOS
    ConfirmarCertificadoNegativa: function () {
        //debugger;
        localStorage.removeItem('ObjetoCertificado');
        $('div#confirmar-certificado-cni').fadeOut();

        var objetoPersona = {
            IdCuenta: Busqueda.Autenticacion.IdCuenta
            , EsFolio: false
            , Solicitante: Busqueda.Autenticacion.DatosPersonales
            , Beneficiario: Busqueda.Persona
            , Organizacion: Busqueda.organizacion
            , IdRepresentante: ($('#cboPeJuSolicitanteMenu').val() > 0 ? $('#cboPeJuSolicitanteMenu').val() : null)
        };
        if (Object.keys(Certificado)) {
            var resultado = Certificado.GuardarCertificadoFolioElectronico(JSON.stringify(objetoPersona))
            if (resultado.Exito) {
                Busqueda.NumeroTransacion = resultado.NumeroTransacion;
                Busqueda.IdTransaccion = resultado.IdTransaccion;
                Busqueda.Servicio = JSON.parse(localStorage.getItem('Servicios')).find(el => el.CodigoInterno == Busqueda.CodigoInternoCertificado)

                var folioIntegrado = {
                    IdUsuario: Busqueda.Autenticacion.IdCuenta,
                    IdTransaccion: Busqueda.IdTransaccion,
                    NoTransaccion: Busqueda.NumeroTransacion,
                    Servicio: Busqueda.Servicio.Nombre.toUpperCase(),//'CERTIFICADO DE NEGATIVA DE INSCRIPCION',
                    Modalidad: 'NA',
                    CodigoInternoModalidad: 'NA',
                    Calificacion: '',
                    CodServicio: Busqueda.Servicio.CodigoInterno,//'CNI',
                    codigoInternoServicio: Busqueda.Servicio.CodigoInterno,//'CNI'
                    TituloCertificado: Busqueda.Servicio.Nombre.toUpperCase()
                };
                localStorage.setItem('ObjetoCertificado', JSON.stringify(folioIntegrado));
                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Success.clase, 'Se realizo el guardado exitosamente...!');

                Busqueda.RenderizarCertificadoNegativa('certificado-consulta-negativa');
                $('div#div-certificado-negativa').fadeIn();
            }
            else {
                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'Error al guardar los datos...!');
            }
        }
        //console.log(JSON.stringify(objetoPersona));
    },
    CancelarCertificadoNegativa: function () {
        $('div#confirmar-certificado-cni').fadeOut();
        $('div#confirmar-certificado-ins').fadeOut();
    },
    RenderizarCertificadoNegativa: function (divClass) {
        var url = utils.accessEnvironment("Ventanilla", "url", APP.environment) + "/Principal/ConsultaCertificadoNegativa";
        APP.renderHTML(url, null, divClass);
    },
    GuardarCertificadoNegativa: function (objetoJson) {
        const Api = '/Tramite/GuardarConsultaCertificado?objetoJson=' + objetoJson;
        const headers = { Authorization: 'Bearer ' + String(utils.tokenVentanilla().access_token) };

        return JSON.parse($.ajax({
            type: 'POST',
            url: APP.urlVentanillaAPI + Api,
            dataType: 'json',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", headers.Authorization);
                utils.mostrarLoader();
            },
            success: function (respuesta) {
                //debugger;
                console.log(respuesta);
                return respuesta;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                utils.mostrarError(xhr, "ConsultaInstitucionalFinca.js metodo GuardarCertificadoFolioElectronico");
            },
            complete: function (d) {
                utils.mostrarLoader();
            }
        }).responseText);
    },
    llenarSelect: function () {
        //debugger;
        //COMBO TIPO BUSQUEDA
        $("select#cbo-tipo-busqueda").chosen({ width: "100%" });
        $("select#cbo-tipo-busqueda").trigger("chosen:updated");
        //COMBO REGISTRO
        $('select#cbo-registro').chosen({ width: "100%" });
        $('select#cbo-registro').append(`<option id="${0}" value="${0}">Selecccione...</option>`);
        $('select#cbo-registro').append(Busqueda.Autenticacion.organizaciones.map(el => `<option id="${el.IdOrganizacion}" value="${el.CodigoInterno}" >${el.Departamento}</option>`));
        $("select#cbo-registro").trigger("chosen:updated");

        //COMBO PERSONA JURIDICA
        //const LISTAPERSONAJURIDICA = Busqueda.ObtenerPersonaJuridicaCuenta();

        let cuenta = "";
        if (localStorage.JsonAuth)
            cuenta = JSON.parse(localStorage.JsonAuth).Nombre;

        Busqueda.ObtenerPersonaJuridicaCuenta(cuenta);
        $('select#cbo-personaJuridica').chosen({ width: "100%" });
        $('select#cbo-personaJuridica').append(`<option id="${0}" value="${0}">Selecccione...</option>`);
        $('select#cbo-personaJuridica').append(Busqueda.arregloPersonaJuridica.map(el => `<option id="${el.IdPersonaJuridica}" value="${el.IdPersonaJuridica}" >${el.NombreComercial}</option>`));
        $("select#cbo-personaJuridica").trigger("chosen:updated");
        Busqueda.establecerPersonaJuridica();
    },

    establecerPersonaJuridica: function () {
        try {
            let IdPersona = $("select#cboPeJuSolicitanteMenu").val();
            let Codigo = (JSON.parse(localStorage.getItem("JsonAuth")).ListaPersonaRepresentada.find(x => x.IdPersona == +IdPersona) || {}).Nombre;
            let IdPersonaJuridica = (Busqueda.arregloPersonaJuridica.find(x => x.NombreComercial == Codigo) || {}).IdPersonaJuridica;
            if (IdPersonaJuridica) {
                $('#cbo-personaJuridica').val(IdPersonaJuridica)
                $('#cbo-personaJuridica').prop('disabled', true)
                $("#cbo-personaJuridica").trigger("chosen:updated");
            }
        } catch (e) {
            console.log(e);
        }

    },
    resetearSelect: function () {
        $("select#cbo-tipo-busqueda option[value='0']").attr('selected', true);
        $("select#cbo-tipo-busqueda").val(0);
        $("select#cbo-tipo-busqueda").trigger("chosen:updated");

        $("select#cbo-registro option[value='0']").attr('selected', true);
        $("select#cbo-registro").val(0);
        $("select#cbo-registro").trigger("chosen:updated");

        //$("select#cbo-personaJuridica option[value='0']").attr('selected', true);
        //$("select#cbo-personaJuridica").val(0);
        //$("select#cbo-personaJuridica").trigger("chosen:updated");

        Busqueda.ValoresSeleccionados='0';
        Busqueda.SeleccionRegistro='0';
    },
    toggle_Busqueda: function () {
        //debugger;
        Busqueda.valorSeleccionado = this.value;
        $('input#txt-filtro-finca').val('');
        switch (Busqueda.valorSeleccionado) {
            case "Nap":
                //$("div#cbo_tipo_busqueda_chosen").hide();
                $('label#lbl-filtro').text('Finca / Nap:').focus();
                $('input#txt-filtro-finca').attr('placeholder', 'Finca / Nap');
                $('input#txt-filtro-finca').focus();
                $('input#txt-filtro-finca').unbind();
                break;
            case "Interesado":
                //$("div#cbo_tipo_busqueda_chosen").hide();
                $('label#lbl-filtro').text('Interesado:');
                $('input#txt-filtro-finca').attr('placeholder', 'Nombre Interesado');
                $('input#txt-filtro-finca').focus();
                Busqueda.buscarPersona();
                break;
            default:
                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'Por favor selecciones una opcion valida');
                //Busqueda.resetearSelect();
                break;
        }
        $('input#txt-filtro-finca').show().focus();
    },
    toogle_Registro: function () {
        //debugger;
        Busqueda.SeleccionRegistro = this.value;
    },
    notificar_Extractado: function (NumeroFinca = '', IdRegistroProcedencia = 0) {
        const objetoNotificacion = { NumeroFinca, IdRegistroProcedencia};
        const headers = { Authorization: 'Bearer ' + String(utils.tokenVentanilla().access_token) };
        return $.ajax({
            url: APP.urlVentanillaAPI + '/TramiteLinea/NotificarExtractado',
            type: "POST",
            async: false,
            dataType: "json",
            data: objetoNotificacion,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", headers.Authorization);
                utils.mostrarLoader();
            },
            success: function (respuesta) {
                if (respuesta) {
                    Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Success.clase, 'Finca Notificada');
                } else {
                    Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'No se realizo la notificación');
                }

                return respuesta;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                utils.mostrarError(xhr, "ConsultaInstitucionalFinca.js metodo NotificarFinca");
            },
            complete: function (d) {
                utils.mostrarLoader();
            }
        }).responseJSON;

    },
    BuscarInteresados_Finca: function () {
        //debugger;
        Busqueda.arrayBuzonFincas.length = 0;
        Busqueda.LLenarTblBuzonFinca(Busqueda.arrayBuzonFincas);
        Busqueda.organizacion = $('select#cbo-registro').val();
        const IDPERSONAJURIDICA = ( $("#cbo-personaJuridica option:selected").val() || 0 );

        if (Busqueda.SeleccionRegistro != '0') {
            if (Busqueda.valorSeleccionado != "0" && IDPERSONAJURIDICA != 0) {
                $("div#cbo_registro_chosen").css('border', '1px solid green');
                $("div#cbo_tipo_busqueda_chosen").css('border', '1px solid green');
                $("div#cbo_personaJuridica_chosen").css('border', '1px solid green');
                var valor = $('input#txt-filtro-finca').val();
                Busqueda.OrganizacionActual = Busqueda.Autenticacion.organizaciones.find(el => el.CodigoInterno == Busqueda.organizacion);
                if (valor) {
                    $("div#cbo_tipo_busqueda_chosen").show();
                    $("input#txt-filtro-finca").css('border', '1px solid green');
                   // $('input#txt-filtro-finca').hide();
                    var busquedaValor = {
                        TipoBusqueda: Busqueda.valorSeleccionado
                        , ValorBuscado: valor
                        , Organizacion: Busqueda.organizacion
                    };
                    var IdOrganizacion = Busqueda.OrganizacionActual.IdOrganizacion;
                    Busqueda.IdOrganizacion = IdOrganizacion;
                    var objetoEstadoFinca = {
                        NumeroFinca: valor,
                        IdOrganizacion: IdOrganizacion
                    };
                    Busqueda.EstadoFinca = Busqueda.ObtenerEstadoFincaConsultar(objetoEstadoFinca);

                    const EstaActiva = (Busqueda.EstadoFinca.find(el => el.Valor == 'EstadoFinca') || { Estado : 0 }).Estado === 1;
                    const EstaCatastrada = (Busqueda.EstadoFinca.find(el => el.Valor == 'Catastrada') || { Estado: 0 }).Estado == 1;
                    const EstaExtractada = (Busqueda.EstadoFinca.find(el => el.Valor == 'Extractada') || { Estado: 0 }).Estado == 1;
                    const EstaInmovilizada = (Busqueda.EstadoFinca.find(el => el.Valor == 'Inmovilizacion') || { Estado: 0 }).Estado == 1;

                    switch (Busqueda.valorSeleccionado) {
                        case 'Nap':
                            if (!Busqueda.EstadoFinca.length) {
                                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'No se encuentra información para este número de finca');
                                return;
                            }
                            if (EstaInmovilizada) {
                                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'La finca no: ' + valor + ' se encuentra Inmovilizada');
                                //return;
                            }
                            if(!EstaActiva) {
                                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'La finca no: ' + valor + ' se encuentra Inactiva');
                                return;
                            }
                            if(!EstaExtractada){
                                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, `La finca no: ${valor} no se encuentra extractada`);
                                return;
                            }
                            if(!EstaCatastrada) {
                                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'La finca no: ' + valor + ' no se encuentra Catastrada');
                            }

                            Busqueda.arrayBuzonFincas = Busqueda.ObtenerDatosInteresados(JSON.stringify(busquedaValor)).Interesados;

                            if(!(Busqueda.arrayBuzonFincas || []).length) {
                                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'No se encontraron datos relacionado a este número de finca');
                            }

                            Busqueda.LLenarTblBuzonFinca(Busqueda.arrayBuzonFincas);
                            $('div#buzon-finca').slideDown();

                            break;
                        case 'Interesado':
                            Busqueda.arrayBuzonFincas = Busqueda.ObtenerDatosInteresados(JSON.stringify(busquedaValor)).Interesados;
                            if (Busqueda.arrayBuzonFincas.length > 0) {

                                $('div#confirmar-certificado-ins').fadeIn();
                                if (Object.keys(Busqueda.Persona).length === 0) {
                                    Busqueda.Persona.NombreCompleto = valor;
                                }

                                Busqueda.LLenarTblBuzonFinca(Busqueda.arrayBuzonFincas);
                                $('div#buzon-finca').slideDown();
                                //Busqueda.resetearSelect();
                            }
                            else {
                                $('div#confirmar-certificado-cni').fadeIn();
                                if (Object.keys(Busqueda.Persona).length === 0) {
                                    Busqueda.Persona.NombreCompleto = valor;
                                }
                            }
                            break;

                        default:
                    }
                }
                else {
                    Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'Por favor complete los datos necesarios');
                    $("input#txt-filtro-finca").css('border', '1px solid red').focus();
                    //Busqueda.resetearSelect();
                }
            }
            else {
                Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'Por favor selecciones una opcion valida');
                $("div#cbo_tipo_busqueda_chosen").css('border', '1px solid red').focus();
                $("div#cbo_personaJuridica_chosen").css('border', '1px solid red').focus();
                //Busqueda.resetearSelect();
            }

        }
        else {
            Busqueda.MostrarAlerta('div#mensaje-busqueda', Busqueda.tipoAlerta.Delete.clase, 'Por favor selecciones una opcion valida');
            $("div#cbo_registro_chosen").css('border', '1px solid red').focus();
            //Busqueda.resetearSelect();
        }
        //Busqueda.resetearSelect();

    },
    ObtenerEstadoFincaConsultar: function (objeto) {
        //debugger;
        //var Api = '/Tramite/ObtenerDatosFincaPorEstadosBajaUsuarioExt?numeroFinca=' + objeto.NumeroFinca +'&idOrganizacion='+ objeto.IdOrganizacion;
        var headers = { Authorization: 'Bearer ' + String(utils.tokenVentanilla().access_token) };
        let objetoJson = { "tipoRegistro": 'INMU', "cuentaRegistral": objeto.NumeroFinca };
        return JSON.parse($.ajax({
            url: APP.urlVentanillaAPI + '/Tramite/ObtenerDatosFincaPorEstadosBajaUsuarioExt',
            type: "GET",
            async: false,
            dataType: "json",
            data: {
                NumeroFinca: JSON.stringify(objetoJson),
                IdOrganizacion: objeto.IdOrganizacion
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", headers.Authorization);
                localStorage.removeItem('store-datosFincaXestadoBaja');
                utils.mostrarLoader();
            },
            async: false,
            success: function (respuesta) {
                //debugger;
                return respuesta;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                utils.mostrarError(xhr, "ConsultaInstitucionalFinca.js metodo ObtenerDatosInteresados");
            },
            complete: function (d) {
                utils.mostrarLoader();
            }
        }).responseText);
    },
    ObtenerDatosInteresados: function (objeto) {
       //debugger;
        var Api = '/Tramite/ObtenerInteresadoFinca?objetoJson=' + objeto;
        var headers = { Authorization: 'Bearer ' + String(utils.tokenVentanilla().access_token) };

        return JSON.parse($.ajax({
            type: 'GET',
            url: APP.urlVentanillaAPI + Api,
            dataType: 'json',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", headers.Authorization);
                utils.mostrarLoader();
            },
            success: function (respuesta) {
                //debugger;
                return respuesta;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                utils.mostrarError(xhr, "ConsultaInstitucionalFinca.js metodo ObtenerDatosInteresados");
            },
            complete: function (d) {
                utils.mostrarLoader();
            }
        }).responseText);
    },

    ObtenerPersonaJuridicaCuenta: function (cuenta) {

        var Api = '/Tramite/ObtenerPersonaJuridicaCuenta?cuenta=' + cuenta;
        var headers = { Authorization: 'Bearer ' + String(utils.tokenVentanilla().access_token) };

        $.ajax({
            type: 'GET',
            url: APP.urlVentanillaAPI + Api,
            dataType: 'json',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", headers.Authorization);
                utils.mostrarLoader();
            },
            success: function (respuesta) {
                //debugger;
                if (Array.isArray(respuesta.PersonaJuridica))
                    Busqueda.arregloPersonaJuridica = respuesta.PersonaJuridica;
                else
                    Busqueda.arregloPersonaJuridica.push(respuesta.PersonaJuridica);

            },
            error: function (xhr, ajaxOptions, thrownError) {
                utils.mostrarError(xhr, "ConsultaInstitucionalFinca.js metodo ObtenerPersonaJuridicaCuenta");
            },
            complete: function (d) {
                utils.mostrarLoader();
            }
        });

        return (Busqueda.arregloPersonaJuridica || []);

    },



    MostrarAlerta: function (contenedor, clase, msg) {
        $(contenedor).fadeIn();
        $(contenedor).addClass(clase);
        $(contenedor).text(msg);
        setTimeout(function () {
            $(contenedor).fadeOut(2000, function () {
                $(contenedor).removeClass(clase);
            });
        }, 3000);
    },
    buscarPersona: function () {
        //debugger;
        var $resultsFinder = $("div.SolicitanteResultsFinder");
        var $inputFinder = $("input#txt-filtro-finca");
        //var $loadingFinder = $("a.fincaLoadingContent");
        var query = "";
        var current_ajaxId = "";

        //KeyUp Event
        $inputFinder.val("").keyup(function (event) {

            if (!event) event = window.event;
            var code = event.keyCode;

            if (event.key === 'Control' || event.key === 'c') {
                return;
            }

            var value = $.trim($(this).val());
            $(this).val($(this).val().toUpperCase());

            if (query == value) {
                //$('input#txtSolicitante').data('Persona', 0);
                Busqueda.Persona = new Object();
                return;
            }
            else {
                query = value;
            }
            //If input is Empty, Delete And Hide Results Wrapper.
            if (value == "") {
                $resultsFinder
                    .addClass("hide")
                    .html("");
                Busqueda.arrPersonas = [];
                //$('input#txtSolicitante').data('Persona', 0);
                Busqueda.Persona = new Object();
            }
            else {

                //$loadingFinder.removeClass("hide");
                utils.delay(this, function () {
                    var param = $.trim($inputFinder.val());
                    var semilla = Math.random();

                    current_ajaxId = semilla;

                    $.ajax({
                        type: 'GET',
                        url: APP.urlVentanillaAPI + "/TablaBasica/ObtenerPersona",
                        dataType: 'json',
                        data: {
                            Nombre: param,
                            Identificacion: param,
                            seed: semilla
                        },
                        async: false,
                        success: function (arrPersonas) {


                            //$loadingFinder.addClass("hide");

                            //LIMPIANDO CONTROLES LUEGO DE OBTENER RESULTADOS DE LA BUSQUEDA
                            //$("input#txt-filtro-finca").val('');

                            // Aqui debemos comparar los datos arrojados de los 2 servicios //
                            Busqueda.arrPersonas = arrPersonas.Data.filter(p => !['CodEmpl'].includes(p.CodigoTipoIdentificacion));
                            if (Busqueda.arrPersonas.length === 0) {
                                Busqueda.Persona = new Object();
                            }
                            var $ul = $("<ul>");
                            if (param !== "" && current_ajaxId === semilla) {
                                for (i = 0; i < Busqueda.arrPersonas.length; i++) {
                                    var $li = $("<li>", { tabindex: 1 });
                                    $li
                                        .data({
                                            id: Busqueda.arrPersonas[i].IdPersona + "_" + Busqueda.arrPersonas[i].IdTipoIdentificacion + "_" + Busqueda.arrPersonas[i].Consecutivo
                                        })
                                        .html(
                                            "<a>" +
                                            "	<div class='persona_Info'>" +
                                            "		<h6 class='per_Desc' title='" + Busqueda.arrPersonas[i].NombreCompleto.toUpperCase() + "'>" + Busqueda.arrPersonas[i].NombreCompleto.toUpperCase() + "</h6>" +
                                            "		<span class='per_ID'>" + Busqueda.arrPersonas[i].TipoIdentificacion + " : " + Busqueda.arrPersonas[i].CodigoIdentificacion + "</span>" +
                                            "	</div>" +
                                            "</a>"
                                        );
                                    $ul
                                        .prepend($li);
                                }
                                $resultsFinder
                                    .html($ul)
                                    .removeClass("hide");
                                $ul
                                    .find("li")
                                    .unbind()
                                    .bind("click", function () {

                                        var $this = $(this);
                                        var arrPerClicked = $this.data("id").split("_");
                                        var perID = arrPerClicked[2];
                                        var perIDTipoId = arrPerClicked[1];
                                        Busqueda.Persona = Busqueda.arrPersonas.filter(function (x) {
                                            return x["Consecutivo"] == perID && x["IdTipoIdentificacion"] == perIDTipoId;
                                        })[0];

                                        /* Llenar Campos */
                                        //$("input#txtSolicitante").data('Persona', Paso1.Persona.IdPersona);
                                        $("input#txt-filtro-finca").val(Busqueda.Persona.NombreCompleto.toUpperCase());
                                        $("input#txt-filtro-finca").focus();
                                    })
                                    .end()
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            utils.mostrarError(xhr, "CotizacionPaso1.js metodo buscarPersona");
                        },
                        complete: function (d) { }
                    });
                }, 400);
            }
        }).keydown(function (event) {
            //debugger;
            var code = (event.keyCode) ? event.keyCode : event.which;
            if (code == 13) {
                return false;
            }
        }).focus(function () {
            if ($inputFinder.val() != "") {
                $resultsFinder.removeClass("hide");
            }
        })
            .blur(function () {
                utils.delay(this, function () {
                    $resultsFinder.addClass("hide");
                    var valor = $('input#txt-filtro-finca');
                    if (/^([0-9])*$/.test(valor.val()) && Busqueda.arrPersonas.length === 0) {
                        valor.val('');
                    }
                }, 500);
            });


    },
    MostrarCertificado: function (control) {
        //debugger;
        utils.mostrarLoader();
        localStorage.removeItem('ValoresSeleccionados');
        let idAsiento = control.dataset.idAsiento;
        let estadoAsiento = control.dataset.estadoAsiento;

        var beneficiario = Busqueda.arrayBuzonFincas.find(el => el.IdAsiento == idAsiento && el.CodigoInternoEstado == estadoAsiento);
        let objetoJson = {
            beneficiario,
            Organizacion: Busqueda.organizacion,
            IdOrganizacion:Busqueda.IdOrganizacion

        };
        sessionStorage.setItem('Beneficiario', JSON.stringify(beneficiario));
        localStorage.setItem('ValoresSeleccionados', JSON.stringify(objetoJson));

        let vista = JSON.parse(localStorage.getItem('VistaActual'));
        switch (vista) {
            case "ConsultaInstitucional":
                $('div#Filtro').slideUp();
                $('div#div-certificado').slideDown();
                setTimeout(function () {
                    Certificado.MostrarCertificadoFinca();
                }, 0);
                break;

            default:
        }
    },
    ObtenerInformacionCertificado: function (objetoJson) {
        //debugger;
        var Api = '/Tramite/ObtenerInformacionCertificadoConsulta?objetoJson=' + objetoJson;
        var headers = { Authorization: 'Bearer ' + String(utils.tokenVentanilla().access_token) };

        return JSON.parse($.ajax({
            type: 'GET',
            url: APP.urlVentanillaAPI + Api,
            dataType: 'json',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", headers.Authorization);
                utils.mostrarLoader();
            },
            success: function (respuesta) {
                //debugger;
                console.log(respuesta);
                return respuesta;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                utils.mostrarError(xhr, "ConsultaInstitucionalFinca.js metodo ObtenerDatosInteresados");
            },
            complete: function (d) {
                utils.mostrarLoader();
            }
        }).responseText);
    },
    LLenarTblBuzonFinca: function (array) {
        $('table#tbl-buzon-finca').DataTable({
            "destroy": true,
            "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "Todos"]],
            "language": utils.idiomaDataTable(),
            "data": array,
            'columns': [
                {
                    sTitle: "No. Finca",
                    mDataProp: "NumeroFinca",
                    className: "center w7em",
                    orderable: true
                },
                {
                    sTitle: "Asiento",
                    mDataProp: "IdAsiento",
                    className: "oculto",
                    orderable: true,
                    render: function (d) {
                        return d;
                    }
                },
                {
                    sTitle: "Asiento",
                    mDataProp: "NumeroAsiento",
                    className: "center w7em",
                    orderable: true,
                    render: function (d) {
                        return d;
                    }
                },
                {
                    sTitle: "Estado Asiento",
                    mDataProp: "EstadoAsiento",
                    className: "center w7em",
                    orderable: true,
                    render: function (d) {
                        return d;
                    }
                },
                {
                    sTitle: "Seccion",
                    mDataProp: "Seccion",
                    className: "w7em text-align-left",
                    orderable: true,
                    render: function (d) {
                        return d;
                    }
                },
                {
                    sTitle: "Propietarios",
                    mDataProp: "Propietarios",
                    className: "text-align-left",
                    orderable: true,
                    render: function (ps) {
                        return '<ul>' + ps.map((p)=> `<li>${p.NombreCompleto}</li>`).join('') + '</ul>';
                    }
                },

                {
                    sTitle: "Estado Finca",
                    mDataProp: "EstadoExtractado",
                    className: "centrar w7em",
                    orderable: true,
                },
                {
                    sTitle: "Opciones",
                    mDataProp: "IdAsiento",
                    className: "centrar w7em",
                    orderable: true,
                    render: function (data, type, row, meta) {
                        if(row.CodigoInternoEstadoExtractado == 'NoExtract'){
                            return `
                                    <div class="tooltip">
                                      <button
                                          type="button"
                                          class="ghostaccion centrar"
                                          onClick="Busqueda.notificar_Extractado('${row.NumeroFinca.toString()}', ${Busqueda.IdOrganizacion})">
                                              <i class="fa fa-book"></i>
                                      </button>
                                      <span class="tooltiptext">Notificar Extractado</span>
                                    </div>
                                    `;
                        }

                        return `
                                    <div class="tooltip">
                                        <button type="button"
                                           data-id-asiento="${data}"
                                           data-estado-asiento="${row.CodigoInternoEstado}"
                                           class="ghostaccion centrar"
                                           onClick="Busqueda.MostrarCertificado(this)">
                                                <i class="fa fa-search"></i>
                                        </button>
                                        <span class="tooltiptext">Ver Detalle</span>
                                    </div>
                                        `;
                    }
                }
            ]
        });
    }
};
$(document).ready(function () {
    Busqueda.Init();
});
