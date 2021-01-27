//$(document).ready(function(){
var timeout = 30000;
var plg_regs_reassign_reassign_enable = false;
var url = '';
var json = '';
var reg_status = '';
var plg_regs_reassign_filter_list = [];
var reassigned_today = new Map();
var today = new Date();

let str_today = today.getFullYear() + '-' + ((today.getMonth()+1)<10 ? '0' : '') + (today.getMonth()+1) + '-' + today.getDate();
today = new Date(str_today);

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

function check_filter(index, value, reqbyiditem){
    let result = true;
    if (index != 'array'){
        /**
         * Проверка на массив. В некоторых случаях value определяется как объект вместо Array
         */
        let is_array = false;
        $.each(value, function(vindex,vvalue){
            is_array = (vindex === 0);
            return false;
        });
        
        if(/*Array.isArray(value)*/is_array){
            result = (value.indexOf(reqbyiditem[index])>=0); 
        } else if(typeof(value) === 'object'){
            $.each(value, function(vindex,vvalue){
               result = check_filter(vindex, vvalue, reqbyiditem[vindex]); 
               return result;
            });
        }
    } else {
        //for(let filter of value.array){
        $.each(value, function(vindex,vvalue){
            for(let reqbyid_arrayitem of reqbyiditem[vindex]){
                $.each(vvalue, function(vvindex,vvvalue){
                    result = check_filter(vvindex, vvalue[vvindex], reqbyid_arrayitem); 
                    return result;
                    /*if (!result) {
                        break;
                    }*/
                });
            }
        });
    }
    return result;
}

function check_JSON_Filter(json_filter, reqbyid){
    //console.log("json_filter",json_filter);
    //console.log("reqbyid",reqbyid);
    let filterstatus = true;
    for(let filter of json_filter){
        $.each(filter, function(index,value){
           filterstatus = check_filter(index, value, reqbyid);//(value.indexOf(reqbyid[index])>=0); 
           return filterstatus;
        });        
        if (filterstatus) {
            break;
        }
    }
    return filterstatus;
}

async function getLocalStorageValue(name){
    return new Promise(resolve => {
        chrome.storage.local.get(name, data=> {
        resolve(data);
        });
    });
}

  /*async function connect(db){
    //db.open(indexeddb, function () {
      console.log("indexedDB open");
    //});  
  }  
  async function query(db, filter){
     
      db.table("reassigns").query("appealNumber").filter(filter).execute(return new Promise(resolve => function(r){
        console.log("result filter",r);
        resolve (r);      
      }));
    
  }
  
  async function getCount(reassignDate, reassignReg){
      let db = new exDB();
      await connect(db);
      let reasign_end_date = new Date(reassignDate); 
      reasign_end_date = new Date(reasign_end_date.setDate(reasign_end_date.getDate() + 1));
      //let filter = "return item.reassignReg=='"+value+"' && return item.reassignDate>="+ reasign_date.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime() +" ";
      let filter = "return item.reassignReg=='"+reassignReg+"' && item.reassignDate>="+ reassignDate.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime();
      console.log("filter",filter);
      let res = await query(db, filter);
      return res;  
  } */
function getCount(reassignDate, reassignReg){
  var db = new exDB();
  db.open(indexeddb, function () {
    let reasign_end_date = new Date(reassignDate); 
    reasign_end_date = new Date(reasign_end_date.setDate(reasign_end_date.getDate() + 1));
    //let filter = "return item.reassignReg=='"+value+"' && return item.reassignDate>="+ reasign_date.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime() +" ";
    let filter = "return item.reassignReg=='"+reassignReg+"' && item.reassignDate>="+ reassignDate.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime();
    //console.log("filter:",filter);
        
    db.table("reassigns").query("appealNumber").filter(filter).execute(function(r){
      //console.log("result:",r);          
      if (r != null && r.length > 0){
        //reg = r.length;
        //reassigned_today[reassignReg] = r.length;
        reassigned_today.set(reassignReg, {"count": r.length, "limit": reassigned_today.get(reassignReg).limit});
      } else {
        //reg = 0;
        //reassigned_today[reassignReg] = 0;
        reassigned_today.set(reassignReg, {"count": 0, "limit": reassigned_today.get(reassignReg).limit});
      }
    });
  });
}

    
(async() => {
var server;
  
  let indexeddb_json = await getLocalStorageValue('plg_regs_reassign_indexeddb');
  indexeddb = JSON.parse(Object.values(indexeddb_json)[0]);
  console.log("indexeddb:",indexeddb);
  
  timeout = await getLocalStorageValue('plg_regs_reassign_timeout');
  timeout = ((typeof(timeout) != "undefined" && Object.values(timeout) != null && Object.values(timeout)[0] != "") ? parseInt(Object.values(timeout)[0]) : 60000);
  console.log("timeout:",timeout);
  
  plg_regs_reassign_reassign_enable = await getLocalStorageValue('plg_regs_reassign_reassign_enable');
  plg_regs_reassign_reassign_enable = Object.values(plg_regs_reassign_reassign_enable)[0];
  console.log("plg_regs_reassign_reassign_enable:",plg_regs_reassign_reassign_enable);
  
  url = await getLocalStorageValue('plg_regs_reassign_req_url');
  url = Object.values(url)[0];
  console.log("url:",url);
  
  json = await getLocalStorageValue('plg_regs_reassign_req_json');
  json = Object.values(json)[0];
  console.log("json:",json);
  
  reg_status = await getLocalStorageValue('plg_regs_reassign_status');
  reg_status = ((typeof(reg_status) != "undefined" && Object.values(reg_status) != null && Object.values(reg_status)[0] != "") ? Object.values(reg_status)[0] : "initial_examinations");  
  //console.log(reg_status);
  console.log("reg_status:",reg_status);
  
  plg_regs_preregs_reassign_type = await getLocalStorageValue('plg_regs_preregs_reassign_type');
  plg_regs_preregs_reassign_type = Object.values(plg_regs_preregs_reassign_type)[0];
  console.log("plg_regs_preregs_reassign_type:",plg_regs_preregs_reassign_type);
  
  plg_regs_reassign_filter_list = await getLocalStorageValue('plg_regs_reassign_filter_list');
  plg_regs_reassign_filter_list = JSON.parse(Object.values(plg_regs_reassign_filter_list)[0]);
  console.log("plg_regs_reassign_filter_list:",plg_regs_reassign_filter_list);

  if(reassigned_today.size <= 0){
    $.each(plg_regs_reassign_filter_list, function(index,value){
      $.each(value.regs, function(index,value){
        //reassigned_today[value] = 0;
        reassigned_today.set(value.login, {"count": 0, "limit": typeof(value.limit) != "undefined" ? value.limit : 0});
        //reassigned_today.length += 1;
        let reasign_date = new Date(today);
        getCount(reasign_date, value.login);
      });
    });              
  }
  
  /*console.log(reassigned_today);
  $.each(reassigned_today, function(index,value){
    console.log(reassigned_today[index]);
    let reasign_date = new Date(today);
    getCount(reasign_date, index, reassigned_today[index]);
  });*/

  
  /*let date_today = new Date();            
  let str_date_today = date_today.getFullYear() + '-' + ((date_today.getMonth()+1)<10 ? '0' : '') + (date_today.getMonth()+1) + '-' + date_today.getDate();
                  
  let reasign_date = new Date(str_date_today);

  let reassigned_today = 0; 
  reassigned_today = await getCount(reasign_date,'naushakova');
  console.log("naushakova: ",reassigned_today);*/
 
  setInterval(function (){
    function postAjaxData(url, json){
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
    }
    
    function getAjaxData(url){
      var result = "";
      $.ajax({
        url: url,
        dataType: "json",
        method: "GET",
        contentType: "application/json;charset=UTF-8",
        async: false,
        success: function(data) {
          result = data;
        } 
      });
      return result
    } 
        
    if(document.webkitVisibilityState == 'visible'){      
      //let plg_regs_reassign_reassign_enable = await getLocalStorageValue('plg_regs_reassign_reassign_enable');
      if(plg_regs_reassign_reassign_enable == true){
        /**
         *Получаем распределяемые обращения.
         **/
        $.ajax({
          url: url,
          dataType: "json",
          data: json/*JSON.stringify(json)*/,
          method: "POST",
          contentType: "application/json;charset=UTF-8",
          async: true,
          success: function(data) {
            /**
             *Результат выполнения POST запроса
             **/
            console.log(data);
            /**
             *Массив регов для типа источника поступлений обращений с количеством "заявлений(обр.)" разбитый по дате исполнения по регламенту.  
             **/
            if (data.requests.length > 0){
              
              let date_today = new Date();            
              let str_date_today = date_today.getFullYear() + '-' + ((date_today.getMonth()+1)<10 ? '0' : '') + (date_today.getMonth()+1) + '-' + date_today.getDate();
                  
              let reasign_date = new Date(str_date_today);
                  
              if (today.getTime() != reasign_date.getTime()){
                reassigned_today = new Map();
                today = reasign_date;
              }                   

              if(reassigned_today.size <= 0){
                $.each(plg_regs_reassign_filter_list, function(index,value){
                  $.each(value.regs, function(index,value){ 
                    reassigned_today.set(value.login, 0);
                  });
                });              
              }
              console.log("reassigned_today:",reassigned_today);

              let reg_list = [];
              $.each(plg_regs_reassign_filter_list, function(index,value){
                
                /**
                 *подсчет количества по дням
                **/
                
                let regs = []; 
                
                //let reg_list_item = value.regs.split(',');
                let reg_list_item = [];
                
                for(let reg of value.regs){
                    reg_list_item.push(reg.login);                        
                }
                        
                $.each(reg_list_item, function(reg_index,reg_item){
                  //console.log(reg_item);
                  //            {"pageNumber":0,"pageSize":10,"statuses":["reg_validations"],"executionDate":{"dateFrom":"2020-12-31","dateTo":"2020-12-31"},"subjectRF":["12"],"executorDepartments":["12.053"],"executors":["asianeev"],"byActiveExecutor":true}
                  let regjson = {pageNumber:0,pageSize:1000,statuses:[reg_status],executors:[reg_item],byActiveExecutor:true};
                  let req = postAjaxData('http://ppoz-service-bal-01.prod.egrn:9001/manager/requests',regjson);
                  //console.log("Запрос в работе у "+reg_item,regjson);
                  //console.log("В работе у "+reg_item,req);
                  
                  let count_date = [];
                  $.each(req.requests, function(request_index,request_item){
                    let date = request_item.executionDate.substr(0,10);
                    count_date[date] = (typeof(count_date[date]) == "undefined" ? 1 : count_date[date] + 1);                  
                  });
                  
                  let reg = {login: reg_item, count: req.requests.length, today: reasign_date, /*reassigned_today: reassigned_today[reg_item],*/ count_date: count_date};
                  
                  /**
                   *поиск и вставка рега по возрастанию исходя из колличества обращений
                  **/
                  let insertindex = -1;      
                  if(regs.length>0){                    
                    $.each(regs, function(index,item){
                      if(item.count >= reg.count){
                        regs.splice(index, 0, reg);
                        insertindex = index; 
                        return false;
                      }  
                    });                    
                  }
                  if(insertindex < 0){
                    regs.push(reg);
                  }                                                                                          
                });

                /**
                 *вставка скиска регов по источнику поступлений
                **/
                reg_list.push({group:value.group,json_filter:value.json_filter, regs: regs});
                                                                
              }); 
              console.log('reg_list:',reg_list);
              //plg_regs_reassign_filter_list[0].senderjson_filter
              
              //console.log(reg_list);
              $.each(data.requests, function(index,req_item){
                let date = req_item.executionDate.substr(0,10);
                let reassigned = false;   
                
                /**
                 *получаем обращение
                **/
                url_byId = "http://ppoz-service-bal-01.prod.egrn:9001/manager/requests/byId?id=".concat(req_item.appealNumber);
                let reqbyid = getAjaxData(url_byId);                
                console.log("Обращение",reqbyid);
                
                /**
                 *подбираем рега для назначения
                **/
                console.log("<----------------Перебор условия фильтров---------------->");
                $.each(reg_list, function(index,reg_list_item){                  
                  //console.log("Категория регов с соответствующими свойствами обращения");
                  //console.log("JSON фильтр",reg_list_item);
                  /*let json_filter_match = reg_list_item.json_filter.match(/"'"+reqbyid.senderName+"'"/g);
                  console.log(json_filter_match);*/
                  /**
                   *Выбор списка регов по источнику поступления или другому признаку деления пользователей.                  
                  **/
                  //if(reg_list_item.json_filter.indexOf("'"+reqbyid.senderName+"'")>=0){
                  if(check_JSON_Filter(reg_list_item.json_filter,reqbyid) === true){
                    console.log("Категория предварительно подобрана.");
                    console.log("JSON фильтр",reg_list_item);
                    /**
                     *поиск рега с наименьшим количеством на дату исполнения по регламенту распределяемого обращения
                    **/
                    let reg_index_min_count = -1;
                    let reg_date_min_count = 9999;
                    
                    if (plg_regs_preregs_reassign_type == "result"){                     
                      $.each(reg_list_item.regs, function(reg_index,reg_item){
                        reg_item.count_date[date] = (typeof(reg_item.count_date[date]) == "undefined" ? 0 : reg_item.count_date[date]);
                        if (reg_item.count_date[date] < reg_date_min_count){
                          reg_date_min_count = reg_item.count_date[date];
                          reg_index_min_count = reg_index;  
                        }                      
                      });
                    } else {                                    

                      let reassigned_today_min_count = 9999;
                      /*$.each(reassigned_today, function(index,value){
                        if (value < reassigned_today_min_count){
                          reassigned_today_min_count = value;
                        }
                      });*/
                      let tmp_regs = [];
                      $.each(reg_list, function(tmp_index,tmp_reg_list_item){
                        if (reg_list_item.group === tmp_reg_list_item.group){
                            for(let value of tmp_reg_list_item.regs){
                                if (typeof(value.limit) != "undefined"){
                                    if (reassigned_today.get(value.login) < value.limit){
                                        tmp_regs.push(value.login);
                                    }
                                } else {
                                    tmp_regs.push(value.login);                        
                                }
                            }   
                        }
                      });
                      
                      for(let key of reassigned_today.keys()){                        
                        if (reassigned_today.get(key) < reassigned_today_min_count && $.inArray(key, tmp_regs) >= 0){                        
                          reassigned_today_min_count = reassigned_today.get(key).count;
                        }
                      }                      

                      let reg_date_min_count = 9999;
                                            
                      $.each(reg_list_item.regs, function(reg_index,reg_item){                        
                        reg_item.count_date[date] = (typeof(reg_item.count_date[date]) == "undefined" ? 0 : reg_item.count_date[date]);
                        if (reg_item.count_date[date] < reg_date_min_count && reassigned_today_min_count == reassigned_today.get(reg_item.login).count/*reassigned_today[reg_item.login]*/){
                          reg_date_min_count = reg_item.count_date[date];
                          reg_index_min_count = reg_index;  
                        }                      
                      });

                      //let reglogin = reg_list_item.regs[reg_index_min_count].login;

                    }
                    /**
                     *назначение обращения на подобранного рега
                    **/
                    if (reg_index_min_count >= 0){
                      reg_list_item.regs[reg_index_min_count].count_date[date] = reg_list_item.regs[reg_index_min_count].count_date[date] + 1;                      
                      //console.log("Подобранный рег",reg_list_item.regs[reg_index_min_count]);                      
                      //{"requestNumbers":["PKPVDMFC-2020-12-30-367882"],"role":"PKURP_PREREG","user":"osradzhabova"}
                      let role = (reg_status == "find_object_to_extractions" ? "PKURP_INFO" : (reg_status == "reg_validations" ? "PKURP_REG" : "PKURP_PREREG"));
                      let reassignjson = {requestNumbers:[req_item.appealNumber],role:role,user:reg_list_item.regs[reg_index_min_count].login};
                      console.log("Регистратор подобран. JSON data запроса переназначения:",reassignjson);
                      /**
                       * назначение на выбранного рега
                       */
                      /*let reassignreq = postAjaxData('http://ppoz-service-bal-01.prod.egrn:9001/manager/assign/reassign',reassignjson);
                      console.log("Запос вернул", reassignreq);
                      */
                      reassigned = true;
                      console.log("Колличество после назначения:",reg_list_item);
                      
                      
                      //reassigned_today[reg_list_item.regs[reg_index_min_count].login] = reassigned_today[reg_list_item.regs[reg_index_min_count].login] + 1;
                      reassigned_today.set(reg_list_item.regs[reg_index_min_count].login, {"count":reassigned_today.get(reg_list_item.regs[reg_index_min_count].login).count + 1,"limit":reassigned_today.get(reg_list_item.regs[reg_index_min_count].login).limit});
                      
                      let count_kuvd = [];
                      /*$.each(reqbyid, function(index,item){                                            
                        if(count_kuvd.length>0){
                          if ($.inArray(item.idKUVDRecord, count_kuvd) < 0){
                            count_kuvd.push(item.idKUVDRecord);
                          }
                        } else {
                          count_kuvd.push(item.idKUVDRecord);
                        }                        
                      });*/
                      for(var j=0; j<reqbyid.statements.length; j++){
                        if(count_kuvd.length>0){
                          if ($.inArray(reqbyid.statements[j].idKUVDRecord, count_kuvd) < 0){
                            count_kuvd.push(reqbyid.statements[j].idKUVDRecord);
                          }
                        } else {
                          count_kuvd.push(reqbyid.statements[j].idKUVDRecord);
                        }
                      }
                      //console.log("Список заявлений: ",count_kuvd);
                      
                      /**
                       *Запись о назначение в IndexedDB
                      **/
                      /*chrome.runtime.sendMessage({"cmd": "open", "params": indexeddb}, function (result) {
                        if (result && result.RUNTIME_ERROR) {
                          console.error(result.RUNTIME_ERROR.message);
                          result = null;
                        }
                      });*/
                      /*chrome.runtime.sendMessage({
                          reassignReg: reg_list_item.regs[reg_index_min_count].login,
                          appealNumber: req_item.appealNumber,
                          reassignDate: new Date(),
                          kuvdCount: count_kuvd.length
                        }, function (result) {
                        if (result && result.RUNTIME_ERROR) {
                          console.error(result.RUNTIME_ERROR.message);
                          result = null;
                        }
                      });*/
                      
                      var db = new exDB();
                      db.open(indexeddb, function () {
                        db.table("reassigns").add({
                          reassignReg: reg_list_item.regs[reg_index_min_count].login,
                          appealNumber: req_item.appealNumber,
                          reassignDate: (new Date().getTime()), //время в милисекундах (1сек - 1000 мсек) от 1 января 1970 г. 00:00:00 по UTC
                          kuvdCount: count_kuvd.length
                        },function(r){
                          /*if(r.length>0){
                            console.log("Запись в IndexedDB",r[0]);
                          } else {
                            console.log("Запись в IndexedDB",r);  
                          }*/
                          console.log("Запись в IndexedDB",r);
                          /*db.close(function(){
                            //console.log("closed");
                          }); */
                        });
                      });                      
                    }/* else {
                       console.log("По обращение не подобрпн рег:",req_item); 
                    }*/                     
                    //break();
                    if (!reassigned){
                        console.log("??????????В списке регов фильтра не нашлось пользователя данной категории(либо лимит исчерпан, либо ошибка). Перходим на следующий фильтр по приоритету.??????????");
                    } else {
                        return false;
                    }
                  } else {
                    
                  } 
                });
                if (reassigned === false){
                    console.log("!!!!!!!!!!!По обращению не подобрана категория регов.!!!!!!!!!!!"); 
                }
              });
            }
            //result = data;
            //$(selctor).html(data.requests.length);
          } 
        });
      }    
    }
  }, timeout);
})();    
//});