// JavaScript Document
/**
 *шаблон фильтра: 
 *[{"login":"navkuznetcova","percent":100},{"login":"iatrofimova","percent":100},{"login":"ibkolesnikova","percent":50}]
 *{"serviceName":["Исправление технической ошибки/ внесение сведений в ЕГРН, по заявлению"],"array":{"statements":{"actionTitle":["Исправление технических ошибок, содержащихся в ЕГРН"]}}}
 */

$(document).ready(function(){

  //$("#statistic").html("Подразделение: ".concat(podrazc));
  $('#plg_regs_reassign_reassign_enable')[0].checked = (window.localStorage.plg_regs_reassign_reassign_enable == "true");
  $('#plg_regs_reassign_req_url').val((typeof(window.localStorage.plg_regs_reassign_req_url) != "undefined" && window.localStorage.plg_regs_reassign_req_url != null && window.localStorage.plg_regs_reassign_req_url !="") ? window.localStorage.plg_regs_reassign_req_url : 'http://ppoz-service-bal-01.prod.egrn:9001/manager/requests');
  $('#plg_regs_reassign_req_json').html((typeof(window.localStorage.plg_regs_reassign_req_json) != "undefined" && window.localStorage.plg_regs_reassign_req_json != null && window.localStorage.plg_regs_reassign_req_json !="") ? window.localStorage.plg_regs_reassign_req_json : '{"pageNumber":0,"pageSize":10,"subjectRF":["12"],"executorDepartments":["12.060"],"executors":["vvvolkov"],"byActiveExecutor":true}');
    
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
  var countindex = 0;
  if (typeof(window.localStorage.plg_regs_reassign_filter_list) != "undefined" && window.localStorage.plg_regs_reassign_filter_list != null){
    let plg_regs_reassign_filter_list = JSON.parse(window.localStorage.plg_regs_reassign_filter_list);    
    $.each(plg_regs_reassign_filter_list, function(index,value){
      htm += '<div class="row" id="plg_def_filter_'+index+'">'+
              '<div class="col-sm-1">'+
                '<label style="font-size: 11px">Группа</label><br>'+
                '<input class="plg_def_filter filter_group" data-index="'+index+'" type="number" value="'+value.group+'" step="1" min="0" max="10" style="height:26px">'+
              '</div>'+
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Список регов</label><br>'+
                '<textarea class="plg_def_filter filter_regs" data-index="'+index+'" rows="5" placeholder="Список регов через запятую" style="height:100px; width:100%">'+
                JSON.stringify(value.regs)+
                '</textarea>'+
              '</div>'+
              '<div class="col-sm-8">'+
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
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Список регов</label><br>'+
                '<textarea class="plg_def_filter filter_regs" data-index="'+countindex+'" rows="5" placeholder="Список регов через запятую" style="height:100px; width:100%"></textarea>'+
              '</div>'+
              '<div class="col-sm-8">'+
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
            'regs' : ($('.plg_def_filter.filter_regs[data-index="'+index+'"]').val() != "") ? JSON.parse($('.plg_def_filter.filter_regs[data-index="'+index+'"]').val()) : "", 
            'json_filter': ($('.plg_def_filter.filter_json[data-index="'+index+'"]').val() !="") ? JSON.parse($('.plg_def_filter.filter_json[data-index="'+index+'"]').val()) : ""
        };
        if(!$('#plg_def_filter_'+(index+1)).is('#plg_def_filter_'+(index+1))){
            let html = $('#plg_regs_reassign_filter_list').html();
            html += '<div class="row" id="plg_def_filter_'+(index+1)+'">'+
              '<div class="col-sm-1">'+
                '<label style="font-size: 11px">Группа</label><br>'+
                '<input class="plg_def_filter filter_group" data-index="'+(index+1)+'" type="number" value="0" step="1" min="0" max="10" style="height:26px">'+
              '</div>'+
              '<div class="col-sm-3">'+
                '<label style="font-size: 11px">Список регов</label><br>'+
                '<textarea class="plg_def_filter filter_regs" data-index="'+(index+1)+'" rows="5" placeholder="Список регов через запятую" style="height:100px; width:100%"></textarea>'+
              '</div>'+
              '<div class="col-sm-8">'+
                '<label style="font-size: 11px">JSON фильтр</label><br>'+
                '<textarea class="plg_def_filter filter_json" data-index="'+(index+1)+'" rows="5" placeholder="Введите источник поиска. Например: senderName" style="height:100px; width:100%"></textarea>'+
              '</div>'+
              /*'<div class="col-sm-4">'+
                '<label style="font-size: 11px">Значения поиска</label><br>'+              
                '<textarea class="plg_def_filter filter_values" data-index="'+(index+1)+'" rows="3" placeholder="Список типов ИС через точку запятую в кавычках: \'Другое\';\'ЕПГУ\';\'ИС Бизнес Сообществ\'" style="height:50px; width:100%"></textarea>'+
              '</div>'+*/
            '</div>';
            let val_reg = $('.plg_def_filter.filter_regs[data-index="'+index+'"]').val();
            let val_json = $('.plg_def_filter.filter_json[data-index="'+index+'"]').val();
            $('#plg_regs_reassign_filter_list').html(html);
            $('.plg_def_filter.filter_regs[data-index="'+index+'"]').val(val_reg);
            $('.plg_def_filter.filter_json[data-index="'+index+'"]').val(val_json);
        }
    } else {
        plg_regs_reassign_filter_list.splice([index], 1);
        if(!$('#plg_def_filter_'+(index+2)).is('#plg_def_filter_'+(index+2))){
            $('#plg_def_filter_'+(index+1)).remove();
        }
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
  
  $('body').on('change past kayup select', '#plg_regs_reassign_req_json', function(){  
    let plg_regs_reassign_req_json = $('#plg_regs_reassign_req_json').val();  
    window.localStorage.plg_regs_reassign_req_json = plg_regs_reassign_req_json;
    chrome.storage.local.set({plg_regs_reassign_req_json: plg_regs_reassign_req_json}, function(){
            console.log(plg_regs_reassign_req_json);
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