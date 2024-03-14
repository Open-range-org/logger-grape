$(document).ready(function () {
    var path = settings.path;
    var directory = settings.directory;
    var lastIndex = 0;
    var logCount = 0;
    var newUnreadLogCount = 0;
    var fileNameList = [];
    loadFile();
    loadDirectory();
    setInterval(function () { loadFile(); }, 2000);
    $('#refresh').click(function () {
        loadFile();
    });

    $('#info').click(function () {
        $('#modal-body').html(" log path is : " + path);
    });
    $(document).on('change', '#file-select', function() {
        path= `${directory}/${$(this).val()}`;
        $('#console-div').empty();
        logCount=0;
        lastIndex=0;
        newUnreadLogCount=0;
        loadFile();
    });
    $('#markAllRead').click(function () {
        $('.warning-block').removeClass("bg-unread");
        $('title').text("Logger Grape");
        newUnreadLogCount = 0;
    });
    function loadDirectory(){
        let options= "";
        $.ajax({ url: directory, dataType: 'html',
        success: function(response) {
             $('#hidden-directory').html(response);
             setTimeout(() => {
             $('#hidden-directory pre a').each(function () { 
                let fileName= $(this).text();
                if(fileName.includes(settings.filename)){
                    fileNameList.push($(this).text());
                    options+= `<option value="${fileName}">${fileName}</option>`;
                }
              });
              $('#file-select').html(options)
              console.log(fileNameList);
              }, 100);
            //  $('')
            } 
     });
    }
    function loadFile() {
        var lineArray = [];
        var xhttp = new XMLHttpRequest();
        method = "GET",
            url = path + '?cache=false';
        xhttp.open(method, url, true);
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = this.responseText;
                //console.log(this.responseText);
                lineArray = response.split("\n");
                if (lastIndex != lineArray.length) {
                    var content = lineArray.slice(lastIndex, lineArray.length);
                    var tempCount = UpdateUi(content);
                    lastIndex = $.trim(content) == "" ? lineArray.length - 1 : lineArray.length;
                    logCount = logCount + tempCount;
                    $('#logCount').text(logCount);
                    lineArray = [];
                    response = '';
                    if (tempCount != 0) {
                        newUnreadLogCount = newUnreadLogCount + tempCount;
                        $('title').text('(' + newUnreadLogCount + ') Logger Grape');
                    }
                }
            }
        };
        xhttp.send();
    }
    function UpdateUi(newLines) {
        var count = 0;
        $.each(newLines, function (index, item) {
            item = item.trim().replace(' ', '&nbsp;').replace('http://', '<u>http://</u>').replace('https://', '<u>https://</u>');

            if (item != '') {
                itemSplitArray = item.replace(' ', '&nbsp;').split("|");
                if (itemSplitArray.length > 2) {
                    let spanType= itemSplitArray[1].toLowerCase().includes('error') ? '<span class="text-danger">' : '<span class="text-info">';
                    let logSymbol = itemSplitArray[1].toLowerCase().includes('error') ? '<i class="fas fa-exclamation-triangle text-danger"></i>' : 
                                        itemSplitArray[1].toLowerCase().includes('warning ') ?'<i class="fas fa-info-circle text-warning"></i>' : '<i class="fas fa-info-circle text-info"></i>';
                    itemSplitArray[0] = logSymbol+ '<span class="text-info"> ' + itemSplitArray[0].trim() + '</span>';
                    itemSplitArray[1] = spanType + itemSplitArray[1] + '</span>';
                    itemSplitArray[2] = '<span>' + itemSplitArray[2] + '</span>';
                    item = itemSplitArray.join('|');
                    count++;
                }
                $('#console-div').append('<div class="col-sm-12 bg-unread warning-block">' + item + '</div><br/>');
            }
        });
        return count;
    }

});