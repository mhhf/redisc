Template.group.rendered = function(){
  
  var data = _.map(this.data.group.distribution, function( e ){
    return [ e._userId, e.shares ];
  });

  var chart = c3.generate({
    bindto: this.find('.chart'),
    data: {
        // iris data from R
        columns: data,
        type : 'pie',
        onclick: function (d, i) { console.log("onclick", d, i); },
        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    }
  });
}
