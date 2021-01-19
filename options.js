// JavaScript Document
$(document).ready(function(){

  //$("#statistic").html("Подразделение: ".concat(podrazc));
  $('#plg_on_reassign_enable')[0].checked = (window.localStorage.plg_on_reassign_enable == "true");
  $('#plg_def_url').val((typeof(window.localStorage.plg_def_url) != "undefined" && window.localStorage.plg_def_url != null && window.localStorage.plg_def_url !="") ? window.localStorage.plg_def_url : 'http://ppoz-service-bal-01.prod.egrn:9001/manager/requests');
  $('#plg_def_json').html((typeof(window.localStorage.plg_def_json) != "undefined" && window.localStorage.plg_def_json != null && window.localStorage.plg_def_json !="") ? window.localStorage.plg_def_json : '{"pageNumber":0,"pageSize":10,"subjectRF":["12"],"executorDepartments":["12.060"],"executors":["vvvolkov"],"byActiveExecutor":true}');
    
  let indexeddb = {
  server: 'regs-preregs-reassign',
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
  $('#plg_def_indexeddb').html((typeof(window.localStorage.plg_regs_preregs_reassign_indexeddb) != "undefined" && window.localStorage.plg_regs_preregs_reassign_indexeddb != null && window.localStorage.plg_regs_preregs_reassign_indexeddb !="") ? window.localStorage.plg_regs_preregs_reassign_indexeddb : JSON.stringify(indexeddb));
  
  $('#plg_timeout').val((typeof(window.localStorage.plg_timeout) != "undefined" && window.localStorage.plg_timeout != null && window.localStorage.plg_timeout !="") ? window.localStorage.plg_timeout : '60000');
  $('#plg_def_status').val((typeof(window.localStorage.plg_def_status) != "undefined" && window.localStorage.plg_def_status != null && window.localStorage.plg_def_status !="") ? window.localStorage.plg_def_status : 'initial_examinations');  
  
  let htm = '';
  let countindex = 0;
  if (typeof(window.localStorage.plg_list_regssendertypes) != "undefined" && window.localStorage.plg_list_regssendertypes != null){
    let plg_list_regssendertypes = JSON.parse(window.localStorage.plg_list_regssendertypes);    
    $.each(plg_list_regssendertypes, function(index,value){
      htm += '<div class="row">'+
              '<div class="col-sm-6">'+
                '<label style="font-size: 11px">Список регов</label><br>'+
                '<textarea class="plg_def_regs" data-index="'+index+'" rows="3" placeholder="Список регов через запятую" style="height:50px; width:100%">'+
                value.regs+
                '</textarea>'+
              '</div>'+
              '<div class="col-sm-6">'+
                '<label style="font-size: 11px">Тип ИС (источник)</label><br>'+              
                '<textarea class="plg_def_sender_types" data-index="'+index+'" rows="3" placeholder="Список типов ИС через точку запятую в кавычках: \'Другое\';\'ЕПГУ\';\'ИС Бизнес Сообществ\'" style="height:50px; width:100%">'+
                value.sendertypes+
                '</textarea>'+
              '</div>'+
            '</div>';
      countindex = index+1;     
    });    
  }
  
  htm += '<div class="row">'+
              '<div class="col-sm-6">'+
                '<label style="font-size: 11px">Список регов</label><br>'+
                '<textarea class="plg_def_regs" data-index="'+countindex+'" rows="3" placeholder="Список регов через запятую" style="height:50px; width:100%"></textarea>'+
              '</div>'+
              '<div class="col-sm-6">'+
                '<label style="font-size: 11px">Тип ИС (источник)</label><br>'+              
                '<textarea class="plg_def_sender_types" data-index="'+countindex+'" rows="3" placeholder="Список типов ИС через точку запятую в кавычках: \'Другое\';\'ЕПГУ\';\'ИС Бизнес Сообществ\'" style="height:50px; width:100%"></textarea>'+
              '</div>'+
           '</div>';  
  $('#plg_list_regssendertypes').html(htm);
  
  $('body').on('click', '#plg_on_reassign_enable', function(){
    let plg_on_reassign_enable = $('#plg_on_reassign_enable')[0].checked;
    window.localStorage.plg_on_reassign_enable = plg_on_reassign_enable;
    chrome.storage.local.set({plg_on_reassign_enable: plg_on_reassign_enable}, function(){
            console.log(plg_on_reassign_enable);
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
   
  $('body').on('click', '#plg_on_reassign_enable', function(){
    let plg_on_reassign_enable = $('#plg_on_reassign_enable')[0].checked;
    window.localStorage.plg_on_reassign_enable = plg_on_reassign_enable;
    chrome.storage.local.set({plg_on_reassign_enable: plg_on_reassign_enable}, function(){
            console.log(plg_on_reassign_enable);
    }); 
  });
  
  $('body').on('change past kayup select', '#plg_timeout', function(){  
    let plg_timeout = $('#plg_timeout').val();  
    window.localStorage.plg_timeout = plg_timeout;
    chrome.storage.local.set({plg_timeout: plg_timeout}, function(){
            console.log(plg_timeout);
    }); 
  });

  $('body').on('change past kayup select', '#plg_def_url', function(){  
    let plg_def_url = $('#plg_def_url').val();  
    window.localStorage.plg_def_url = plg_def_url;
    chrome.storage.local.set({plg_def_url: plg_def_url}, function(){
            console.log(plg_def_url);
    }); 
  });
  
  $('body').on('change past kayup select', '#plg_def_json', function(){  
    let plg_def_json = $('#plg_def_json').val();  
    window.localStorage.plg_def_json = plg_def_json;
    chrome.storage.local.set({plg_def_json: plg_def_json}, function(){
            console.log(plg_def_json);
    }); 
  });
  
  $('body').on('change past kayup select', '#plg_def_indexeddb', function(){  
    let plg_def_indexeddb = $('#plg_def_indexeddb').val();  
    window.localStorage.plg_regs_preregs_reassign_indexeddb = plg_def_indexeddb;
    chrome.storage.local.set({plg_regs_preregs_reassign_indexeddb: plg_def_indexeddb}, function(){
            console.log(plg_def_indexeddb);
    }); 
  });
  
  $('body').on('change past kayup select', '#plg_def_status', function(){  
    let plg_def_status = $('#plg_def_status').val();  
    window.localStorage.plg_def_status = plg_def_status;
    chrome.storage.local.set({plg_def_status: plg_def_status}, function(){
            console.log(plg_def_status);
    }); 
  });
  
  $('body').on('change past kayup select', '.plg_def_regs', function(){  
    let plg_list_regssendertypes = (typeof(window.localStorage.plg_list_regssendertypes) != "undefined" && window.localStorage.plg_list_regssendertypes != null) ? JSON.parse(window.localStorage.plg_list_regssendertypes) : [];
    plg_list_regssendertypes[$(this).data('index')] = {'regs' : $(this).val(), 'sendertypes' : $('.plg_def_sender_types[data-index="'+$(this).data('index')+'"]').val()};  
    window.localStorage.plg_list_regssendertypes = JSON.stringify(plg_list_regssendertypes);
    chrome.storage.local.set({plg_list_regssendertypes: JSON.stringify(plg_list_regssendertypes)}, function(){
            console.log(JSON.stringify(plg_list_regssendertypes));
    }); 
  });

  $('body').on('change past kayup select', '.plg_def_sender_types', function(){  
    let plg_list_regssendertypes = (typeof(window.localStorage.plg_list_regssendertypes) != "undefined" && window.localStorage.plg_list_regssendertypes != null) ? JSON.parse(window.localStorage.plg_list_regssendertypes) : [];
    plg_list_regssendertypes[$(this).data('index')] = {'regs' : $('.plg_def_regs[data-index="'+$(this).data('index')+'"]').val(), 'sendertypes' : $(this).val()};  
    window.localStorage.plg_list_regssendertypes = JSON.stringify(plg_list_regssendertypes);
    chrome.storage.local.set({plg_list_regssendertypes: JSON.stringify(plg_list_regssendertypes)}, function(){
            console.log(JSON.stringify(plg_list_regssendertypes));
    }); 
  });

});