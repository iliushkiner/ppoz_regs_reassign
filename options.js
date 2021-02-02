// JavaScript Document
/**
 *шаблон фильтра: 
 *[{"login":"navkuznetcova","percent":100},{"login":"iatrofimova","percent":100},{"login":"ibkolesnikova","percent":50}]
 *{"serviceName":["Исправление технической ошибки/ внесение сведений в ЕГРН, по заявлению"],"array":{"statements":{"actionTitle":["Исправление технических ошибок, содержащихся в ЕГРН"]}}}
 */

$(document).ready(function(){

  //$("#statistic").html("Подразделение: ".concat(podrazc));
  $('#plg_regs_reassign_reassign_enable')[0].checked = (window.localStorage.plg_regs_reassign_reassign_enable == "true");
  $('#plg_regs_reassign_debug_off_enable')[0].checked = (window.localStorage.plg_regs_reassign_debug_off_enable == "true");
  $('#plg_regs_reassign_req_url').val((typeof(window.localStorage.plg_regs_reassign_req_url) != "undefined" && window.localStorage.plg_regs_reassign_req_url != null && window.localStorage.plg_regs_reassign_req_url !="") ? window.localStorage.plg_regs_reassign_req_url : 'http://ppoz-service-bal-01.prod.egrn:9001/manager/requests');
  //$('#plg_regs_reassign_req_json').html((typeof(window.localStorage.plg_regs_reassign_req_json) != "undefined" && window.localStorage.plg_regs_reassign_req_json != null && window.localStorage.plg_regs_reassign_req_json !="") ? window.localStorage.plg_regs_reassign_req_json : '{"pageNumber":0,"pageSize":10,"subjectRF":["12"],"executorDepartments":["12.060"],"executors":["vvvolkov"],"byActiveExecutor":true}');
    
  let indexeddb = {
  server: 'pkurp-reg-reassign',
  version: 1,
  schema: {
    reassigns: {
      key: { keyPath: 'id', autoIncrement: true },
      // Optionally add indexes
      indexes: {
        reassignReg: { },
        appealNumber: { },
        reassignDate: { }/*,
        kuvdCount: { },*/
        /*answer: { unique: true }*/
      }
    }
  }
  };
  $('#plg_regs_reassign_indexeddb').html((typeof(window.localStorage.plg_regs_reassign_indexeddb) != "undefined" && window.localStorage.plg_regs_reassign_indexeddb != null && window.localStorage.plg_regs_reassign_indexeddb !="") ? window.localStorage.plg_regs_reassign_indexeddb : JSON.stringify(indexeddb));
  
  $('#plg_regs_reassign_timeout').val((typeof(window.localStorage.plg_regs_reassign_timeout) != "undefined" && window.localStorage.plg_regs_reassign_timeout != null && window.localStorage.plg_regs_reassign_timeout !="") ? window.localStorage.plg_regs_reassign_timeout : '60000');
  $('#plg_regs_reassign_status').val((typeof(window.localStorage.plg_regs_reassign_status) != "undefined" && window.localStorage.plg_regs_reassign_status != null && window.localStorage.plg_regs_reassign_status !="") ? window.localStorage.plg_regs_reassign_status : 'initial_examinations');  
  
  let htm = '';
    
  var count_plg_regs_reassign_req_json_index = 0;
  //window.localStorage.plg_regs_reassign_req_json  
  if (typeof(window.localStorage.plg_regs_reassign_req_json_list) != "undefined" && window.localStorage.plg_regs_reassign_req_json_list != null){
      let plg_regs_reassign_req_json_list = JSON.parse(window.localStorage.plg_regs_reassign_req_json_list);    
      $.each(plg_regs_reassign_req_json_list, function(index,value){
        htm += '<div class="row" id="plg_def_regs_reassign_req_json_'+index+'">'+
            '<div class="col-sm-12">'+
                '<label style="font-size: 11px">Данные JSON отправляемые при выборке распределяемых обращений</label><br>'+
                '<textarea class="plg_def_req_json json" data-index="'+index+'" rows="2" size="100%" placeholder="JSON data отправляемая в POST запросе" style="/*height:75px; */width:100%">'+JSON.stringify(value)+'</textarea>'+
            '</div>'+
        '</div>';
        count_plg_regs_reassign_req_json_index = index+1;     
      });      
  }  
  htm += '<div class="row" id="plg_def_regs_reassign_req_json_'+count_plg_regs_reassign_req_json_index+'">'+
            '<div class="col-sm-12">'+
                '<label style="font-size: 11px">Данные JSON отправляемые при выборке распределяемых обращений</label><br>'+
                '<textarea class="plg_def_req_json json" data-index="'+count_plg_regs_reassign_req_json_index+'" rows="2" size="100%" placeholder="JSON data отправляемая в POST запросе" style="/*height:75px; */width:100%"></textarea>'+
            '</div>'+
          '</div>';
  $('#plg_regs_reassign_req_json_list').html(htm);
  
  $('body').on('change', '.plg_def_req_json', function(){  
    let plg_regs_reassign_req_json_list = (typeof(window.localStorage.plg_regs_reassign_req_json_list) != "undefined" && window.localStorage.plg_regs_reassign_req_json_list != null) ? JSON.parse(window.localStorage.plg_regs_reassign_req_json_list) : [];
    
    let index = $(this).data('index');
    if ($('.plg_def_req_json.json[data-index="'+index+'"]').val() != ""){
        plg_regs_reassign_req_json_list[index] = ($('.plg_def_req_json.json[data-index="'+index+'"]').val() != "") ? JSON.parse($('.plg_def_req_json.json[data-index="'+index+'"]').val()) : "";
        if(($("div [id^='plg_def_regs_reassign_req_json_']").length-1) === index){
            $('#plg_def_regs_reassign_req_json_'+index).after('<div class="row" id="plg_def_regs_reassign_req_json_'+(index+1)+'">'+
                '<div class="col-sm-12">'+
                    '<label style="font-size: 11px">Данные JSON отправляемые при выборке распределяемых обращений</label><br>'+
                    '<textarea class="plg_def_req_json json" data-index="'+(index+1)+'" rows="2" size="100%" placeholder="JSON data отправляемая в POST запросе" style="/*height:75px; */width:100%"></textarea>'+
                '</div>'+
            '</div>');
        }
    } else {
        plg_regs_reassign_req_json_list.splice([index], 1);
        $('#plg_def_regs_reassign_req_json_'+(index)).remove();
        for(var j=index+1; j<=$("div [id^='plg_def_regs_reassign_req_json_']").length; j++){
            $("#plg_def_regs_reassign_req_json_"+(j)+" .json").attr('data-index', j-1);
            $("#plg_def_regs_reassign_req_json_"+(j)).attr('id', 'plg_def_regs_reassign_req_json_'+(j-1));            
        }
        /*if(($("div [id^='plg_def_appealnumber']").length-2) === index){
            $('#plg_def_appealnumber_'+(index)).remove();
        }*/
    }
    window.localStorage.plg_regs_reassign_req_json_list = JSON.stringify(plg_regs_reassign_req_json_list);    
    chrome.storage.local.set({plg_regs_reassign_req_json_list: JSON.stringify(plg_regs_reassign_req_json_list)}, function(){
            console.log(JSON.stringify(plg_regs_reassign_req_json_list));
    }); 
  });

    
  
  htm = '';
  var count_appealnumber_index = 0;
  if (typeof(window.localStorage.plg_regs_reassign_appealnumber_list) != "undefined" && window.localStorage.plg_regs_reassign_appealnumber_list != null){
      let plg_regs_reassign_appealnumber_list = JSON.parse(window.localStorage.plg_regs_reassign_appealnumber_list);    
      $.each(plg_regs_reassign_appealnumber_list, function(index,value){
        htm += '<div class="row" id="plg_def_appealnumber_'+index+'">'+
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Номер обращения</label><br>'+
                '<input class="plg_def_appealnumbers appealnumber" data-index="'+index+'" type="text" placeholder="Номер обращения" value="'+((typeof(value.appealnumber) != "undefined" && value.appealnumber != null) ? value.appealnumber : "")+'" style="width:100%">'+
              '</div>'+
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Назначить на рега</label><br>'+
                '<input class="plg_def_appealnumbers reg" data-index="'+index+'" type="text" placeholder="Назначаемый регистратор" value="'+((typeof(value.reg) != "undefined" && value.reg != null) ? value.reg : "")+'" style="width:100%">'+
                '</textarea>'+
              '</div>'+
            '</div>';
        count_appealnumber_index = index+1;     
      });      
  }
  
  htm += '<div class="row" id="plg_def_appealnumber_'+count_appealnumber_index+'">'+
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Номер обращения</label><br>'+
                '<input class="plg_def_appealnumbers appealnumber" data-index="'+count_appealnumber_index+'" type="text" placeholder="Номер обращения" value="" style="width:100%">'+
              '</div>'+
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Назначить на рега</label><br>'+
                '<input class="plg_def_appealnumbers reg" data-index="'+count_appealnumber_index+'" type="text" placeholder="Назначаемый регистратор" value="" style="width:100%">'+
                '</textarea>'+
              '</div>'+
            '</div>';
  $('#plg_regs_reassign_appealnumber_list').html(htm);
  
  $('body').on('change', '.plg_def_appealnumbers', function(){  
    let plg_regs_reassign_appealnumber_list = (typeof(window.localStorage.plg_regs_reassign_appealnumber_list) != "undefined" && window.localStorage.plg_regs_reassign_appealnumber_list != null) ? JSON.parse(window.localStorage.plg_regs_reassign_appealnumber_list) : [];
    
    let index = $(this).data('index');
    if ($('.plg_def_appealnumbers.appealnumber[data-index="'+index+'"]').val() != "" || $('.plg_def_appealnumbers.reg[data-index="'+index+'"]').val() != ""){
        plg_regs_reassign_appealnumber_list[index] = {
            'appealnumber' : ($('.plg_def_appealnumbers.appealnumber[data-index="'+index+'"]').val() != "") ? $('.plg_def_appealnumbers.appealnumber[data-index="'+index+'"]').val() : "",
            'reg' : ($('.plg_def_appealnumbers.reg[data-index="'+index+'"]').val() != "") ? $('.plg_def_appealnumbers.reg[data-index="'+index+'"]').val() : ""            
        };
        if(($("div [id^='plg_def_appealnumber']").length-1) === index){
            $('#plg_def_appealnumber_'+index).after('<div class="row" id="plg_def_appealnumber_'+(index+1)+'">'+
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Номер обращения</label><br>'+
                '<input class="plg_def_appealnumbers appealnumber" data-index="'+(index+1)+'" type="text" placeholder="Номер обращения" value="" style="width:100%">'+
              '</div>'+
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Назначить на рега</label><br>'+
                '<input class="plg_def_appealnumbers reg" data-index="'+(index+1)+'" type="text" placeholder="Назначаемый регистратор" value="" style="width:100%">'+
                '</textarea>'+
              '</div>'+
            '</div>');
        }
    } else {
        plg_regs_reassign_appealnumber_list.splice([index], 1);
        $('#plg_def_appealnumber_'+(index)).remove();
        for(var j=index+1; j<=$("div [id^='plg_def_appealnumber_']").length; j++){
            $("#plg_def_appealnumber_"+(j)+" .plg_def_appealnumbers").attr('data-index', j-1);
            $("#plg_def_appealnumber_"+(j)).attr('id', 'plg_def_appealnumber_'+(j-1));            
        }
        /*if(($("div [id^='plg_def_appealnumber']").length-2) === index){
            $('#plg_def_appealnumber_'+(index)).remove();
        }*/
    }
    window.localStorage.plg_regs_reassign_appealnumber_list = JSON.stringify(plg_regs_reassign_appealnumber_list);    
    chrome.storage.local.set({plg_regs_reassign_appealnumber_list: JSON.stringify(plg_regs_reassign_appealnumber_list)}, function(){
            console.log(JSON.stringify(plg_regs_reassign_appealnumber_list));
    }); 
  });
  
  htm = '';
  var countindex = 0;
  if (typeof(window.localStorage.plg_regs_reassign_filter_list) != "undefined" && window.localStorage.plg_regs_reassign_filter_list != null){
    let plg_regs_reassign_filter_list = JSON.parse(window.localStorage.plg_regs_reassign_filter_list);    
    $.each(plg_regs_reassign_filter_list, function(index,value){
      htm += '<div class="row" id="plg_def_filter_'+index+'">'+
              '<div class="col-sm-1">'+
                '<label style="font-size: 11px">Группа</label><br>'+
                '<input class="plg_def_filter filter_group" data-index="'+index+'" type="number" value="'+value.group+'" step="1" min="0" max="10" style="height:26px">'+
              '</div>'+
              '<div class="col-sm-1">'+
                '<label style="font-size: 11px">Безлимит</label><br>'+
                '<input class="plg_def_filter filter_unlim" data-index="'+index+'" type="checkbox" ' + (value.unlim ? 'checked="checked"' : '') + ' name="filter_unlim">'+
              '</div>'+
              '<div class="col-sm-4">'+
                '<label style="font-size: 11px">Список регов</label><br>'+
                '<textarea class="plg_def_filter filter_regs" data-index="'+index+'" rows="5" placeholder=\'[{"login":"agtanaev","percent":100,"limit":40,"include":"on"}]\' style="height:100px; width:100%">'+
                JSON.stringify(value.regs)+
                '</textarea>'+
              '</div>'+
              '<div class="col-sm-6">'+
                '<label style="font-size: 11px">JSON фильтр</label><br>'+
                '<textarea class="plg_def_filter filter_json" data-index="'+index+'" rows="5" placeholder="Введите источник поиска. Например: senderName" style="height:100px; width:100%">'+
                JSON.stringify(value.json_filter)+
                '</textarea>'+
              '</div>'+
              /*'<div class="col-sm-4">'+
                '<label style="font-size: 11px">Значения поиска</label><br>'+              
                '<textarea class="plg_def_filter filter_values" data-index="'+index+'" rows="3" placeholder="Список назначаемых по источнику поиска через точку запятую в кавычках: \'Другое\';\'ЕПГУ\';\'ИС Бизнес Сообществ\'" style="height:50px; width:100%">'+
                value.filter_values+
                '</textarea>'+
              '</div>'+*/
            '</div>';
      countindex = index+1;     
    });    
  }
  
  htm += '<div class="row" id="plg_def_filter_'+countindex+'">'+
              '<div class="col-sm-1">'+
                '<label style="font-size: 11px">Группа</label><br>'+
                '<input class="plg_def_filter filter_group" data-index="'+countindex+'" type="number" value="0" step="1" min="0" max="10" style="height:26px">'+
              '</div>'+
              '<div class="col-sm-1">'+
                '<label style="font-size: 11px">Безлимит</label><br>'+
                '<input class="plg_def_filter filter_unlim" data-index="'+countindex+'" type="checkbox" name="filter_unlim">'+
              '</div>'+
              '<div class="col-sm-4">'+
                '<label style="font-size: 11px">Список регов</label><br>'+
                '<textarea class="plg_def_filter filter_regs" data-index="'+countindex+'" rows="5" placeholder=\'[{"login":"agtanaev","percent":100,"limit":40,"include":"on"}]\' style="height:100px; width:100%"></textarea>'+
              '</div>'+
              '<div class="col-sm-6">'+
                '<label style="font-size: 11px">JSON фильтр</label><br>'+
                '<textarea class="plg_def_filter filter_json" data-index="'+countindex+'" rows="5" placeholder="Введите источник поиска. Например: senderName" style="height:100px; width:100%"></textarea>'+
              '</div>'+
              /*'<div class="col-sm-4">'+
                '<label style="font-size: 11px">Значения поиска</label><br>'+              
                '<textarea class="plg_def_filter filter_values" data-index="'+countindex+'" rows="3" placeholder="Список типов ИС через точку запятую в кавычках: \'Другое\';\'ЕПГУ\';\'ИС Бизнес Сообществ\'" style="height:50px; width:100%"></textarea>'+
              '</div>'+*/
           '</div>';  
  $('#plg_regs_reassign_filter_list').html(htm);
  
  $('body').on('change past kayup select', '.plg_def_filter', function(){  
    let plg_regs_reassign_filter_list = (typeof(window.localStorage.plg_regs_reassign_filter_list) != "undefined" && window.localStorage.plg_regs_reassign_filter_list != null) ? JSON.parse(window.localStorage.plg_regs_reassign_filter_list) : [];
    
    let index = $(this).data('index');
    if ($('.plg_def_filter.filter_regs[data-index="'+index+'"]').val() != "" || $('.plg_def_filter.filter_json[data-index="'+index+'"]').val() != "" /*|| $('.plg_def_filter.filter_values[data-index="'+index+'"]').val() != ""*/){
        plg_regs_reassign_filter_list[$(this).data('index')] = {
            'group' : ($('.plg_def_filter.filter_group[data-index="'+index+'"]').val() != "") ? $('.plg_def_filter.filter_group[data-index="'+index+'"]').val() : "0",
            'unlim' : $('.plg_def_filter.filter_unlim[data-index="'+index+'"]')[0].checked,
            'regs' : ($('.plg_def_filter.filter_regs[data-index="'+index+'"]').val() != "") ? JSON.parse($('.plg_def_filter.filter_regs[data-index="'+index+'"]').val()) : "", 
            'json_filter': ($('.plg_def_filter.filter_json[data-index="'+index+'"]').val() !="") ? JSON.parse($('.plg_def_filter.filter_json[data-index="'+index+'"]').val()) : ""
        };
        if(($("div [id^='plg_def_filter_']").length-1) === index){
            $('#plg_def_filter_'+index).after('<div class="row" id="plg_def_filter_'+(index+1)+'">'+
              '<div class="col-sm-1">'+
                '<label style="font-size: 11px">Группа</label><br>'+
                '<input class="plg_def_filter filter_group" data-index="'+(index+1)+'" type="number" value="0" step="1" min="0" max="10" style="height:26px">'+
              '</div>'+
              '<div class="col-sm-1">'+
                '<label style="font-size: 11px">Безлимит</label><br>'+
                '<input class="plg_def_filter filter_unlim" data-index="'+(index+1)+'" type="checkbox" name="filter_unlim">'+
              '</div>'+
              '<div class="col-sm-4">'+
                '<label style="font-size: 11px">Список регов</label><br>'+
                '<textarea class="plg_def_filter filter_regs" data-index="'+(index+1)+'" rows="5" placeholder=\'[{"login":"agtanaev","percent":100,"limit":40,"include":"on"}]\' style="height:100px; width:100%"></textarea>'+
              '</div>'+
              '<div class="col-sm-6">'+
                '<label style="font-size: 11px">JSON фильтр</label><br>'+
                '<textarea class="plg_def_filter filter_json" data-index="'+(index+1)+'" rows="5" placeholder="Введите источник поиска. Например: senderName" style="height:100px; width:100%"></textarea>'+
              '</div>'+
            '</div>');
        }
    } else {
        plg_regs_reassign_filter_list.splice([index], 1);
        $('#plg_def_filter_'+(index)).remove();
        for(var j=index+1; j<=$("div [id^='plg_def_filter_']").length; j++){
            $("#plg_def_filter_"+(j)+" .plg_def_filter").attr('data-index', j-1);
            $("#plg_def_filter_"+(j)).attr('id', 'plg_def_filter_'+(j-1));            
        }
        /*if(($("div [id^='plg_def_filter_']").length-2) === index){
            $('#plg_def_filter_'+(index+1)).remove();
        }*/
    }
    window.localStorage.plg_regs_reassign_filter_list = JSON.stringify(plg_regs_reassign_filter_list);    
    chrome.storage.local.set({plg_regs_reassign_filter_list: JSON.stringify(plg_regs_reassign_filter_list)}, function(){
            console.log(JSON.stringify(plg_regs_reassign_filter_list));
    }); 
  });

  
  $('body').on('click', '#plg_regs_reassign_reassign_enable', function(){
    let plg_regs_reassign_reassign_enable = $('#plg_regs_reassign_reassign_enable')[0].checked;
    window.localStorage.plg_regs_reassign_reassign_enable = plg_regs_reassign_reassign_enable;
    chrome.storage.local.set({plg_regs_reassign_reassign_enable: plg_regs_reassign_reassign_enable}, function(){
            console.log(plg_regs_reassign_reassign_enable);
    }); 
  });
  
  $('body').on('click', '#plg_regs_reassign_debug_off_enable', function(){
    let plg_regs_reassign_debug_off_enable = $('#plg_regs_reassign_debug_off_enable')[0].checked;
    window.localStorage.plg_regs_reassign_debug_off_enable = plg_regs_reassign_debug_off_enable;
    chrome.storage.local.set({plg_regs_reassign_debug_off_enable: plg_regs_reassign_debug_off_enable}, function(){
            console.log(plg_regs_reassign_debug_off_enable);
    }); 
  });
       
  $('#plg_type_equal')[0].checked = (window.localStorage.plg_regs_preregs_reassign_type == "equal");
  $('#plg_type_result')[0].checked = (window.localStorage.plg_regs_preregs_reassign_type == "result");

  $('body').on('click', 'input[name="plg_type"]', function(){
    let plg_regs_preregs_reassign_type = $('input[name="plg_type"]:checked').val();
    window.localStorage.plg_regs_preregs_reassign_type = plg_regs_preregs_reassign_type;
    chrome.storage.local.set({plg_regs_preregs_reassign_type: plg_regs_preregs_reassign_type}, function(){
            console.log(plg_regs_preregs_reassign_type);
    }); 
  });
   
  $('body').on('click', '#plg_regs_reassign_reassign_enable', function(){
    let plg_regs_reassign_reassign_enable = $('#plg_regs_reassign_reassign_enable')[0].checked;
    window.localStorage.plg_regs_reassign_reassign_enable = plg_regs_reassign_reassign_enable;
    chrome.storage.local.set({plg_regs_reassign_reassign_enable: plg_regs_reassign_reassign_enable}, function(){
            console.log(plg_regs_reassign_reassign_enable);
    }); 
  });
  
  $('body').on('change past kayup select', '#plg_regs_reassign_timeout', function(){  
    let plg_regs_reassign_timeout = $('#plg_regs_reassign_timeout').val();  
    window.localStorage.plg_regs_reassign_timeout = plg_regs_reassign_timeout;
    chrome.storage.local.set({plg_regs_reassign_timeout: plg_regs_reassign_timeout}, function(){
            console.log(plg_regs_reassign_timeout);
    }); 
  });

  $('body').on('change past kayup select', '#plg_regs_reassign_req_url', function(){  
    let plg_regs_reassign_req_url = $('#plg_regs_reassign_req_url').val();  
    window.localStorage.plg_regs_reassign_req_url = plg_regs_reassign_req_url;
    chrome.storage.local.set({plg_regs_reassign_req_url: plg_regs_reassign_req_url}, function(){
            console.log(plg_regs_reassign_req_url);
    }); 
  });
    
  $('body').on('change past kayup select', '#plg_regs_reassign_indexeddb', function(){  
    let plg_regs_reassign_indexeddb = $('#plg_regs_reassign_indexeddb').val();  
    window.localStorage.plg_regs_reassign_indexeddb = plg_regs_reassign_indexeddb;
    chrome.storage.local.set({plg_regs_reassign_indexeddb: plg_regs_reassign_indexeddb}, function(){
            console.log(plg_regs_reassign_indexeddb);
    }); 
  });
  
  $('body').on('change past kayup select', '#plg_regs_reassign_status', function(){  
    let plg_regs_reassign_status = $('#plg_regs_reassign_status').val();  
    window.localStorage.plg_regs_reassign_status = plg_regs_reassign_status;
    chrome.storage.local.set({plg_regs_reassign_status: plg_regs_reassign_status}, function(){
            console.log(plg_regs_reassign_status);
    }); 
  });
});