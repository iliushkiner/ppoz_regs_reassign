// JavaScript Document
var indexeddb = {
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

indexeddb = (typeof(window.localStorage.plg_regs_reassign_indexeddb) != "undefined" ? JSON.parse(window.localStorage.plg_regs_reassign_indexeddb) : indexeddb);
//indexeddb = JSON.parse(Object.values(indexeddb_json)[0]);

var reg_status = (typeof(window.localStorage.plg_regs_reassign_status) != "undefined") ? (window.localStorage.plg_regs_reassign_status) : "initial_examinations";

function getQuota(db){
  db.getUsageAndQuota(function(r){
    console.log("used", r.usage);
    console.log("quota", r.quota);
    //db.close(function(){console.log("closed");});
  });
}
    
$(document).ready(function(){

  var db = new exDB();
  db.open(indexeddb, function () {
    getQuota(db);
  });
  //var htm = $(".statement-number").html();
  //let podrazc = localStorage['podrazdelenie'];
  /*let podrazc = 'пусто';
  podrazc = chrome.storage.local.get(['podrazdelenie'], function(result){
    console.log(result.podrazdelenie);
  });*/

  //$("#statistic").html("Подразделение: ".concat(podrazc));
  /*let request = {
    region: window.localStorage.plg_def_region,
    podrazdelenie: window.localStorage.plg_def_podraz.split(';')
  };*/
  $('#countdate').on('change past kayup select', function(){  
    let plg_regs_reassign_countdate = $('#countdate').val();  
    window.localStorage.plg_regs_reassign_countdate = plg_regs_reassign_countdate;
    chrome.storage.local.set({plg_regs_reassign_countdate: plg_regs_reassign_countdate}, function(){
            console.log(plg_regs_reassign_countdate);
    });     
  });
  
  $('#filtrdate').on('change past kayup select', function(){
    curent_request = window.localStorage.curent_request;
    load_inf_statistic();  
  });     

  $('#countdate').on('change past kayup select', function(){
    curent_request = window.localStorage.curent_request;
    $("#statistic").html("<div style='text-align: center;'><img src='loading.gif' alt='loading'></div>");  
    load_inf_statistic();
  });     

  $('#countdate').val(window.localStorage.plg_regs_reassign_countdate);
  $("#now").html("<span style='color:red;'>сведения на</span>: <strong style='font-size: 11px'>"+Date()+"</strong>");
  let date_to = new Date();            
  let str_date_to = date_to.getFullYear() + '-' + ((date_to.getMonth()+1)<10 ? '0' : '') + (date_to.getMonth()+1) + '-' + ((date_to.getDate())<10 ? '0' : '') + date_to.getDate();
  $("#filtrdate").val(str_date_to);
  
  load_inf_statistic(); 
});                             

var curentreg = 0;
var curentpodr = 0;

/*function getAjaxData(url, json){
  var result = "";
  $.ajax({
    url: url,
    dataType: "json",
    data: JSON.stringify(json),
    method: "POST",
    contentType: "application/json;charset=UTF-8",
    async: false,
    success: function(data) {
      //console.log(data);
      result = data;
    } 
  });
  return result
} */
function getAjaxData(url, selctor, json){
  $.ajax({
    url: url,
    dataType: "json",
    data: JSON.stringify(json),
    method: "POST",
    contentType: "application/json;charset=UTF-8",
    async: true,
    success: function(data) {
      //console.log(data);
      //result = data;
      //$(selctor).html(data.requests.length);
      let count = ($(selctor).html() != '<img src="loading.gif" alt="loading" class="loading">' ? parseInt($(selctor+" .count").html()) : 0);      
      if (data.requests.length>0){
        $(selctor).html("<span class='count'>" + (count + data.requests.length) + "</count><img src='loading.gif' alt='loading' class='loading'>");
        json.pageNumber++;
        getAjaxData(url, selctor, json)
      } else {
        $(selctor).html("<span class='count'>" + (count) + "</count>");
      }
    } 
  });
}

function getCount(reassignDate, reassignReg, selector){
      var db = new exDB();
      db.open(indexeddb, function () {
        let reasign_end_date = new Date(reassignDate); 
        reasign_end_date = new Date(reasign_end_date.setDate(reasign_end_date.getDate() + 1));
        //let filter = "return item.reassignReg=='"+value+"' && return item.reassignDate>="+ reasign_date.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime() +" ";
        let filter = "return item.reassignReg=='"+reassignReg+"' && item.reassignDate>="+ reassignDate.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime();
        //console.log("filter",filter);
        
        db.table("reassigns").query("appealNumber").filter(filter).execute(function(r){
          if (r != null){
            $(selector).html(r.length);
          } else {
            $(selector).html("-");
          }
          /*db.close(function(){
            console.log("closed");
          });*/
        });
      });
}

function getNums(reassignDate, reassignReg, selector){
  var db = new exDB();
  db.open(indexeddb, function () {
    let reasign_end_date = new Date(reassignDate); 
    reasign_end_date = new Date(reasign_end_date.setDate(reasign_end_date.getDate() + 1));  
    let filter = "return item.reassignReg=='"+reassignReg+"' && item.reassignDate>="+ reassignDate.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime();
    console.log("filter",filter);
        
    db.table("reassigns").query("appealNumber").filter(filter).execute(function(r){
      console.log("result filter с " + reassignDate + " по " + reasign_end_date,r);
      let nums = "";
      let sum = 0;
            
      if (r != null && r.length > 0){
        for(var j=0; j<r.length; j++){
            nums += r[j].appealNumber + "<span style='color: red; font-weight: bold;'>[" + r[j].kuvdCount + "]</span>; ";
            sum += r[j].kuvdCount;
        }      
        $(selector).html("<span style='color: red; font-weight: bold;'>" + ((reassignDate.getDate())<10 ? '0' : '') + reassignDate.getDate() + '.' + ((reassignDate.getMonth()+1)<10 ? '0' : '') + (reassignDate.getMonth()+1) + '.' + reassignDate.getFullYear() + "<!--[" + reassignDate.getTime() + "]--> </span><span style='color: blue; font-weight: bold;'>(всего: " + r.length + " <span style='color: red; font-weight: bold;'>[" + sum + "]</span>)</span>: " + nums);
        //$(selector).html(reassignDate.getDate() + '.' + ((reassignDate.getMonth()+1)<10 ? '0' : '') + (reassignDate.getMonth()+1) + '.' + reassignDate.getFullYear() + "<!--[" + reassignDate.getTime() + "]--> (всего: " + r.length + "): " + nums + "<br><br>");
      } else {
        $(selector).remove();
      } 
      /*db.close(function(){
        console.log("closed");
      });*/
      /*for(var j=0; j<r.length; j++){
        getSum(r[j].appealNumber, "#" + r[j].appealNumber);
      }*/     
      
    });
  });
}

function load_inf_statistic(){
  /*indexeddb = window.localStorage.plg_regs_reassign_indexeddb;
  indexeddb = JSON.parse(Object.values(indexeddb_json)[0]);*/

  
  $("#statistic").html("");
  var htm = "";
  /** 
  *вывод статистики по регам отдела. 
  **/    
  htm += "<div class='stat'>";
  let table = "";
  let prev_assignDate = 0;
  let str_select_date = $("#filtrdate").val();  
  console.log(str_select_date);
  //let select_date = Date.parse(str_select_date.replace("-","/").replace("-","/"));
  //console.log(select_date);
  let dsplit = str_select_date.split("-");
  console.log(dsplit);
  let select_date = new Date(dsplit[0],dsplit[1]-1,dsplit[2]);
  console.log(select_date);
  let date_yesterday = new Date(select_date);
  date_yesterday = new Date(date_yesterday.setDate(date_yesterday.getDate() - 1));
  //console.log(date_yesterday);
  let str_date_yesterday = "";    
  
  str_date_yesterday = ""+ date_yesterday.getFullYear() + '-' + ((date_yesterday.getMonth()+1)<10 ? '0' : '') + (date_yesterday.getMonth()+1) + '-' + ((date_yesterday.getDate())<10 ? '0' : '') + date_yesterday.getDate();
    
  //let regs = (typeof(window.localStorage.plg_def_regs) != "undefined" && window.localStorage.plg_def_regs != null) ? (window.localStorage.plg_def_regs).split(',') : [];
  
  
  htm += "<table class='table table-striped' style='font-size: 12px;'><tbody><theader><tr><th>Регистратор</th><th>В работе на текущий момент</th>";
  
    for (var j=0; j<=parseInt(window.localStorage.plg_regs_reassign_countdate); j++){
      let req_date = new Date(select_date);
      req_date = req_date.setDate(req_date.getDate() - j);
      req_date = new Date(req_date);
      //console.log(req_date);
      str_req_date = ""+req_date.getFullYear() + '-' + ((req_date.getMonth()+1)<10 ? '0' : '') + (req_date.getMonth()+1) + '-' + ((req_date.getDate())<10 ? '0' : '') + req_date.getDate();
      htm +="<th"+((req_date.getUTCDay()==5 || req_date.getUTCDay()==6) ? " style='color:red;'" : "")+">Дата назначения "+str_req_date+"</th>";
    }
  
  htm +="</tr><theader>";
 
  let plg_regs_reassign_filter_list = (typeof(window.localStorage.plg_regs_reassign_filter_list) != "undefined" ? JSON.parse(window.localStorage.plg_regs_reassign_filter_list) : []);
  console.log(plg_regs_reassign_filter_list);
  let regs = [];
  let group_count = -1;
  for(let filter of plg_regs_reassign_filter_list){
      if(group_count < filter.group){
          group_count = filter.group;
      }
  }
  
  for(let group=0; group<=group_count; group++){
    $.each(plg_regs_reassign_filter_list, function(index,value){
        if(group == value.group){
            $.each(value.regs, function(index,value){
                if (regs.length>0){
                    if (regs.indexOf(value.login)<0){        
                        $.merge(regs,[value.login]);
                    }
                } else {
                    $.merge(regs,[value.login]);
                }        
            });
        }
    });
  }
  console.log(regs);
  
  $.each(regs, function(index,value){
    table += "<tr class='reg_" + value + "' data-toggle='collapse' data-target='#reg_reassigned_num_" + value + "'><td class='reg_name'>" + value + "</td><td class='count'><img src='loading.gif' alt='loading' class='loading'></td>";      
    for (var j=0; j<=parseInt(window.localStorage.plg_regs_reassign_countdate); j++){
      let reasign_date = new Date(select_date);
      reasign_date = new Date(reasign_date.setDate(reasign_date.getDate() - j));  
      table += "<td class='date_" + j + "'><img src='loading.gif' alt='loading' class='loading'></td>";
    }
    /**
    *В работе на текущий момент
    *формат "2020-12-09"
    **/
    /*let date_to = new Date();            
    let str_date_to = date_to.getFullYear() + '-' + ((date_to.getMonth()+1)<10 ? '0' : '') + (date_to.getMonth()+1) + '-' + date_to.getDate();*/             
    let requrl = "http://ppoz-service-bal-01.prod.egrn:9001/manager/requests";
             //{"pageNumber":0,"pageSize":1000,"statuses":["reg_validations"],"subjectRF":["12"],"executorDepartments":["12.146"],"executors":["ibkolesnikova"],"byActiveExecutor":true}
    let json = {pageNumber:0,pageSize:1000,statuses:[reg_status],subjectRF:[12],executors:[value],byActiveExecutor:true};
    getAjaxData(requrl,'.reg_'+value+' .count', json);      
    
    table += "</tr>";
    table += "<tr id='reg_reassigned_num_" + value + "' class='collapse'><td class='nums' colspan='" + (window.localStorage.plg_regs_reassign_countdate+2) + "'>";
    let divnums = "";      
    for (var j=parseInt(window.localStorage.plg_regs_reassign_countdate); j>=0; j--){
      let reasign_date = new Date(select_date); 
      reasign_date = new Date(reasign_date.setDate(reasign_date.getDate() - j));
      let str_reassign_date = ""+reasign_date.getFullYear() + '-' + ((reasign_date.getMonth()+1)<10 ? '0' : '') + (reasign_date.getMonth()+1) + '-' + ((reasign_date.getDate())<10 ? '0' : '') + reasign_date.getDate();
      divnums = "<div class='nums_"+str_reassign_date+"'><img src='loading.gif' alt='loading' class='loading'></div>" + divnums;      
    }
    table += divnums + "</td></tr>";    
  });
  
  htm += table;
  
  htm += "</tbody></table>";
  
  htm += "</div>";
  htm = $("#statistic").html() + htm;  
  $("#statistic").html(htm);
  
  $.each(regs, function(index,value){
    for (var j=0; j<=parseInt(window.localStorage.plg_regs_reassign_countdate); j++){
      let reasign_date = new Date(select_date);
      reasign_date = new Date(reasign_date.setDate(reasign_date.getDate() - j));
      getCount(reasign_date, value, '.reg_'+value+' .date_' + j);      
    }
    for (var j=parseInt(window.localStorage.plg_regs_reassign_countdate); j>=0; j--){
      let reasign_date = new Date(select_date); 
      reasign_date = new Date(reasign_date.setDate(reasign_date.getDate() - j));
      let str_reassign_date = ""+reasign_date.getFullYear() + '-' + ((reasign_date.getMonth()+1)<10 ? '0' : '') + (reasign_date.getMonth()+1) + '-' + ((reasign_date.getDate())<10 ? '0' : '') + reasign_date.getDate();
      getNums(reasign_date, value, "#reg_reassigned_num_" + value + " .nums_"+str_reassign_date);
    }
  });     
}
