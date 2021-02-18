 function duration(start, end){

    var sh = Number(start.substr(0,2));
    var sm = Number(start.substr(3,5));
    var eh = Number(end.substr(0,2));
    var em = Number(end.substr(3,5));
    var hour;

    if (eh>sh){
        hour = Number(eh-sh);
    }else{
        hour = Number((eh+24)-sh);
    }
 
    if (sm>0 || em<0){
        var m = sm + em;
        if(m>60){
            hour = hour + 1;
            m=m-60;
        }
    }else{
        var m = '00';
    }
    if(hour<=9){
        hour = String('0'+hour);
    }
    return String(hour+':'+m);
};

module.exports = duration;