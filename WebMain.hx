import SMFile.SongConfig;
import js.html.SelectElement;
import js.html.ButtonElement;
import js.html.URL;
import js.html.Blob;
import haxe.Json;
import js.html.FileReader;
import js.html.FileList;
import js.html.InputElement;
import js.Browser;

using StringTools;

// The main class
class WebMain
{
    static var simfileupload:InputElement;
    static var generatechartbtn:ButtonElement;
    static var thefiles:FileList;

    static var chartselect:SelectElement;
    static var songnameinput:InputElement;
    static var songspeedinput:InputElement;
    static var player1input:InputElement;
    static var player2input:InputElement;
    static var gfversioninput:InputElement;
    static var flipchartinput:InputElement;

    static var curSMFile:SMFile;

    static function parseSMFile(smString:String)
    {
        smString = smString.replace('\r\n', '\n');
        curSMFile = new SMFile(smString);
        // remove any previous options
        while (chartselect.children.length > 0)
        {
            chartselect.remove(0);
        }

        for(i in 0...curSMFile.charts.length)
        {
            var chart = curSMFile.charts[i];
            var opt = Browser.document.createOptionElement();
            opt.value = ''+i;
            opt.innerText = chart.toString();
            chartselect.add(opt);
        }

        songnameinput = cast Browser.document.getElementById('songname');
        songnameinput.value = curSMFile.title;

        trace(curSMFile.title);
        trace(curSMFile.extraHeaderTags);
        trace(curSMFile.bpms);
        trace(curSMFile.chartOffset);
    }

    static function generateChart(e:Dynamic)
    {
        var cfg:SongConfig = {
            song: (songnameinput.value != '') ? songnameinput.value : 'SMSong',
            speed: (songspeedinput.value != '') ? Std.parseFloat(songspeedinput.value) : 1,
            player1: (player1input.value != '') ? player1input.value : 'bf',
            player2: (player2input.value != '') ? player2input.value : 'dad',
            gfVersion: (gfversioninput.value != '') ? gfversioninput.value : 'gf'
        };

        var fnfchart = curSMFile.makeFNFChart(Std.parseInt(chartselect.value), cfg, flipchartinput.checked);
        var blob = new Blob([Json.stringify(fnfchart, null, '\t')], { type: 'text/json' });
        
        var a_elem = Browser.document.createAnchorElement();
        a_elem.href = URL.createObjectURL(blob);
        a_elem.download = '${cfg.song.toLowerCase().replace(' ', '-')}.json';
        Browser.document.body.appendChild(a_elem);
        a_elem.click();
        Browser.document.body.removeChild(a_elem);
    }

    static function handleFiles(e:Dynamic)
    {
        thefiles = e.target.files;
        var simfile = thefiles.item(0);
        
        var fr = new FileReader();
        fr.readAsText(simfile.slice());
        fr.onload = ()->{
            parseSMFile(fr.result);
        };
    }

    static function main()
    {
        trace('-------Welcome to the SM to JSON converter------');
        simfileupload = cast Browser.document.getElementById('fileupload');
        simfileupload.addEventListener('change', handleFiles, false);

        generatechartbtn = cast Browser.document.getElementById('generate-chart');
        generatechartbtn.addEventListener('click', generateChart, false);
        
        chartselect = cast Browser.document.getElementById('chartindex');
        songnameinput = cast Browser.document.getElementById('songname');
        songspeedinput = cast Browser.document.getElementById('songspeed');
        player1input = cast Browser.document.getElementById('player1');
        player2input = cast Browser.document.getElementById('player2');
        gfversioninput = cast Browser.document.getElementById('gfversion');
        flipchartinput = cast Browser.document.getElementById('flipchart');
    }
}