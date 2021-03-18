const jsonfile = require('jsonfile')

var statsPerHari = {}
var statsPer10Match = {}

var statsLast50 = {}
var x_last50 = 1;

var minAcc = 100;
var maxAcc = 0;
var indexMin = 0;
var indexMax = 0;

var statsLast100 = {}
var x_last100 = 1;

var usernameFile = "magnuscarlsen"

var namaAkun = "MagnusCarlsen"

var dk = jsonfile.readFileSync(`results/${usernameFile}.json`, 'utf8');

var last = dk.length - 1;

// Setiap hari

for(x = 1; x <= last; x++)
{

    var target = namaAkun;
    var waktu = "10|1"
    var altWaktu = "10|2"
    var altWaktu2 = "15|2"
    var altWaktu3 = "5|1"

    
    if(statsPerHari[dk[x].date] == null && (dk[x].time == waktu || dk[x].time == altWaktu || dk[x].time == altWaktu2 || dk[x].time == altWaktu3))
    {
        statsPerHari[dk[x].date] = {};
        statsPerHari[dk[x].date].totalAkurasi = 0;
        statsPerHari[dk[x].date].jumlahPermainan = 0;
        statsPerHari[dk[x].date].totalElo = 0;
        statsPerHari[dk[x].date].totalWin = 0;
        statsPerHari[dk[x].date].totalLose = 0;
        statsPerHari[dk[x].date].totalDraw = 0;
        statsPerHari[dk[x].date].hitam = 0;
        statsPerHari[dk[x].date].putih = 0;
        statsPerHari[dk[x].date].musuhTerbanned = 0;
    }

    if(dk[x].pemain1 === target && (dk[x].time == waktu || dk[x].time == altWaktu || dk[x].time == altWaktu2 || dk[x].time == altWaktu3))
    {
        var elo = dk[x].elo1;
        elo = elo.substring(1, elo.length - 1);
        statsPerHari[dk[x].date].totalAkurasi += parseInt(dk[x].akurasi1);
        statsPerHari[dk[x].date].totalElo += parseInt(elo);
        statsPerHari[dk[x].date].jumlahPermainan++;
        statsPerHari[dk[x].date].putih++;

        if(dk[x].skor1 == "1")
        {
            statsPerHari[dk[x].date].totalWin++;
        }

        if(dk[x].skor1 == "0")
        {
            statsPerHari[dk[x].date].totalLose++;
        }

        if(dk[x].skor1 == "½")
        {
            statsPerHari[dk[x].date].totalDraw++;
        }

        if(dk[x].banned2 == true)
        {
            statsPerHari[dk[x].date].musuhTerbanned++;
        }

        //Last 50
        if(x_last50 <= 50)
        {
            if(dk[x].akurasi1 !== null)
            {
                statsLast50[x_last50] = dk[x];
                x_last50++;
            }
        }

        //Last 100
        if(x_last100 <= 100)
        {
            if(dk[x].akurasi1 !== null)
            {
                statsLast100[x_last100] = dk[x];
                x_last100++;
            }
        }
    } else if(dk[x].pemain2 === target && (dk[x].time == waktu || dk[x].time == altWaktu || dk[x].time == altWaktu2 || dk[x].time == altWaktu3))
    {
        var elo = dk[x].elo2;
        elo = elo.substring(1, elo.length - 1);

        statsPerHari[dk[x].date].totalAkurasi += parseInt(dk[x].akurasi2);
        statsPerHari[dk[x].date].totalElo += parseInt(elo);
        statsPerHari[dk[x].date].jumlahPermainan++;
        statsPerHari[dk[x].date].hitam++;

        if(dk[x].skor2 == "1")
        {
            statsPerHari[dk[x].date].totalWin++;
        }

        if(dk[x].skor2 == "0")
        {
            statsPerHari[dk[x].date].totalLose++;
        }

        if(dk[x].skor2 == "½")
        {
            statsPerHari[dk[x].date].totalDraw++;
        }

        if(dk[x].banned1 == true)
        {
            statsPerHari[dk[x].date].musuhTerbanned++;
        }

        //Last 50
        if(x_last50 <= 50)
        {
            if(dk[x].akurasi1 !== null)
            {
                statsLast50[x_last50] = dk[x];
                x_last50++;
            }
        }

        //Last 100
        if(x_last100 <= 100)
        {
            if(dk[x].akurasi1 !== null)
            {
                statsLast100[x_last100] = dk[x];
                x_last100++;
            }
        }
    }
}

//Setiap 10 match
for(x = 1; x < 100; x++)
{
    var target = namaAkun;
    var waktu = "10|1"
    var altWaktu = "10|2"
    var altWaktu2 = "15|2"
    var altWaktu3 = "5|1"

    var index = Math.ceil(x / 10)
    
    if(statsPer10Match[index] == null && (statsLast100[x].time == waktu || statsLast100[x].time == altWaktu || statsLast100[x].time == altWaktu2 || statsLast100[x].time == altWaktu3))
    {
        statsPer10Match[index] = {};
        statsPer10Match[index].totalAkurasi = 0;
        statsPer10Match[index].jumlahPermainan = 0;
        statsPer10Match[index].totalElo = 0;
        statsPer10Match[index].totalWin = 0;
        statsPer10Match[index].totalLose = 0;
        statsPer10Match[index].totalDraw = 0;
        statsPer10Match[index].hitam = 0;
        statsPer10Match[index].putih = 0;
        statsPer10Match[index].musuhTerbanned = 0;
    }

    if(statsLast100[x].pemain1 === target && (statsLast100[x].time == waktu || statsLast100[x].time == altWaktu || statsLast100[x].time == altWaktu2 || statsLast100[x].time == altWaktu3))
    {
        var elo = statsLast100[x].elo1;
        elo = elo.substring(1, elo.length - 1);
        statsPer10Match[index].totalAkurasi += parseInt(statsLast100[x].akurasi1);
        statsPer10Match[index].totalElo += parseInt(elo);
        statsPer10Match[index].jumlahPermainan++;
        statsPer10Match[index].putih++;

        if(statsLast100[x].skor1 == "1")
        {
            statsPer10Match[index].totalWin++;
        }

        if(statsLast100[x].skor1 == "0")
        {
            statsPer10Match[index].totalLose++;
        }

        if(statsLast100[x].skor1 == "½")
        {
            statsPer10Match[index].totalDraw++;
        }

        if(statsLast100[x].banned2 == true)
        {
            statsPer10Match[index].musuhTerbanned++;
        }

        minAcc = (parseFloat(statsLast100[x].akurasi1) < minAcc) ? parseFloat(statsLast100[x].akurasi1) : minAcc;
        indexMin = (minAcc == parseFloat(statsLast100[x].akurasi1)) ? x : indexMin;
        maxAcc = (parseFloat(statsLast100[x].akurasi1) > maxAcc) ? parseFloat(statsLast100[x].akurasi1) : maxAcc;
        indexMax = (maxAcc == parseFloat(statsLast100[x].akurasi1)) ? x : indexMax;

    } else if(statsLast100[x].pemain2 === target && (statsLast100[x].time == waktu || statsLast100[x].time == altWaktu || statsLast100[x].time == altWaktu2 || statsLast100[x].time == altWaktu3))
    {
        var elo = statsLast100[x].elo2;
        elo = elo.substring(1, elo.length - 1);

        statsPer10Match[index].totalAkurasi += parseInt(statsLast100[x].akurasi2);
        statsPer10Match[index].totalElo += parseInt(elo);
        statsPer10Match[index].jumlahPermainan++;
        statsPer10Match[index].hitam++;

        if(statsLast100[x].skor2 == "1")
        {
            statsPer10Match[index].totalWin++;
        }

        if(statsLast100[x].skor2 == "0")
        {
            statsPer10Match[index].totalLose++;
        }

        if(statsLast100[x].skor2 == "½")
        {
            statsPer10Match[index].totalDraw++;
        }

        if(statsLast100[x].banned1 == true)
        {
            statsPer10Match[index].musuhTerbanned++;
        }
        minAcc = (parseFloat(statsLast100[x].akurasi2) < minAcc) ? parseFloat(statsLast100[x].akurasi2) : minAcc;
        indexMin = (minAcc == parseFloat(statsLast100[x].akurasi2)) ? x : indexMin;
        maxAcc = (parseFloat(statsLast100[x].akurasi2) > maxAcc) ? parseFloat(statsLast100[x].akurasi2) : maxAcc;
        indexMax = (maxAcc == parseFloat(statsLast100[x].akurasi2)) ? x : indexMax;
    }
}

for (const [key, value] of Object.entries(statsPerHari)) {
    statsPerHari[key].rerataAkurasi = value.totalAkurasi / value.jumlahPermainan; 
    statsPerHari[key].rerataElo = value.totalElo / value.jumlahPermainan; 
    statsPerHari[key].winningPercentage = ( value.totalWin + ( value.totalDraw * 0.5 ) ) / value.jumlahPermainan * 100;
    statsPerHari[key].winningPercentage = statsPerHari[key].winningPercentage + "%";
}

for (const [key, value] of Object.entries(statsPer10Match)) {
    statsPer10Match[key].rerataAkurasi = value.totalAkurasi / value.jumlahPermainan; 
    statsPer10Match[key].rerataElo = value.totalElo / value.jumlahPermainan; 
    statsPer10Match[key].winningPercentage = ( value.totalWin + ( value.totalDraw * 0.5 ) ) / value.jumlahPermainan * 100;
    statsPer10Match[key].winningPercentage = statsPer10Match[key].winningPercentage + "%";
}

//console.log(statsPerHari);
console.log(statsPer10Match);
console.log(`Min : ${minAcc} , Max : ${maxAcc} Index Min : ${indexMin}, Index Max : ${indexMax}`)