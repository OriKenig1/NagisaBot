const Discord = require("discord.js");
const YTDLC = require('ytdl-core');
const TOKEN = process.env.TOKEN;

const express = require('express');
const app = express();

var bot = new Discord.Client();

const PREFIX = "~";

var fortunes = ["Yes", "No", "Maybe", "Lev is fat"];
var servers =  {}; 
var URL;
var dispatcher;
var stream;
var currConnection;

var code = "Nagisa";
var gather = false;
var gatherSize = 0;
var players = [];
var members = [];
var volume = 1;

var members_rank = [];
var ranks = [0, 0 , 0 , 0 , 0 , 0 , 0 , 0, 0 , 0]; // Unranked, Bronze, Silver, Gold, Platinum, Diamond 5, Diamond 4, Diamond 3, Diamond 2, Diamond 1
var Blue = [];
var Red = [];
var Red_Names = [];
var Blue_Names = [];
var Red_IDS = [];
var Blue_IDS = [];

// set the port of our application
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 5000; 

app.listen(port, () => {
    // will echo 'Our app is running on http://localhost:5000 when run locally'
    console.log('Our app is running on http://localhost:' + port);
});

function play(connection) {
    stream = YTDLC(URL, {filter: "audioonly"});
    URL = "0";
    dispatcher = connection.playStream(stream);

    dispatcher.on("end", function() {
        console.log("END"); 
        if(URL != "0")
            play(connection);  
        else
            connection.disconnect();
    });
}



bot.on("ready", function() {
    console.log("Nagisa Bot, ONLINE");
    bot.user.setGame('dango daikazoku')
});

bot.on("message", function(message) {
    if(message.author.equals(bot.user)) return;
    if(!message.content.startsWith(PREFIX)) return;
    if(message.channel.name != "general" && message.channel.name != "anime_freaks") return;
    
    var args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0].toLowerCase()){
        case "ping":   
            message.channel.send("Pong!");
            break;
        case "info":
            message.channel.send("Nagisa Bot, made by Orangę");
            break;
        case "ask":
            if(args[1])
                 message.channel.send(fortunes[Math.floor(Math.random() * fortunes.length)]);
             else
                message.channel.send("'" + PREFIX + "ask [question]'");
             break;
        case "play":
            if(!message.member.roles.has("288980244516306944") && !message.member.roles.has("288979928160927744")){
                message.channel.send("Nagisa bot is exclusive for the anime freaks");
                return;
            } 
            if(!args[1]){
                message.channel.send("The command is: ~play [link]");
                return;
            }
            if(!message.member.voiceChannel) {
                message.channel.send("You must be in a voice channel to use this command");
                return;
            }

            URL = args[1];
            var matches = URL.match(/watch\?v=\w+/);
            
            if(!matches){
               message.channel.send("This is not a valid youtube link"); 
               return;
            }
            
            if(!message.guild.voiceConnection){
                console.log("connection: OFF");
                message.member.voiceChannel.join().then(function(connection) {
                    play(connection);
                });
            }else{
                console.log("connection: ON");
                dispatcher.end();
                /*
                if(dispatcher.destroyed)
                    play(currConnection, false); 
                else{
                    stream.destroy();
                    dispatcher.end();
                }
                */
                    
            }

            break;
        case "volume":
            if(!args[1]){
                message.channel.send("The command is: ~volume [number]");
                return;
            }
            if(dispatcher == null) return;
            if(args[1] >= 10 && args[1] <= 150)
                dispatcher.setVolume(args[1]/100);
            break;
        case "pause":
            if(!message.member.roles.has("288980244516306944") && !message.member.roles.has("288979928160927744")){
                message.channel.send("Nagisa bot is exclusive for the anime freaks");
                return;
            } 
            if(!dispatcher) return;
            if(dispatcher.paused) return;
            dispatcher.pause();
            break;
        case "resume":
            if(!message.member.roles.has("288980244516306944") && !message.member.roles.has("288979928160927744")){
                message.channel.send("Nagisa bot is exclusive for the anime freaks");
                return;
            } 
            if(!dispatcher) return;
            if(!dispatcher.paused) return;
            dispatcher.resume();
            break;
        case "stop":
            if(!message.member.roles.has("288980244516306944") && !message.member.roles.has("288979928160927744")){
                message.channel.send("Nagisa bot is exclusive for the anime freaks");
                return;
            } 
            URL = "0";
            if(dispatcher) dispatcher.end();
            if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            currConnection = null;
            message.channel.send("Bye Bye");
            break;
        case "gather":
            if(!message.member.roles.has("288979928160927744")) return;
            if(!args[1]){
                message.channel.send("The command is: ~gather [code]");
                return;
            }
            if(gather) message.channel.send("Closing the last gather and opening a new one");

            var pName = "<@" + message.author.id + ">";
            code = args[1];
            console.log(code);
            gatherSize = 0;
            gather = true;
            players = [];
            members = []

            members_rank = [];
            ranks = [0, 0, 0, 0 ,0, 0, 0, 0 ,0 ,0];
            Blue = [];
            Red = [];
            Red_Names = [];
            Blue_Names = [];
            Red_IDS = [];
            Blue_IDS = [];

            message.channel.send(pName + " has opend a gather, the code is '**~" + code + "**'");    
            break;
        case code.toLocaleLowerCase():

            var roles = message.member.roles;
            let no_mic = message.guild.roles.find("name", "No Microphone");
            if(roles.has(no_mic.id)) return;

            pName = "<@" + message.author.id + ">";
            if(!gather) return;
            if(gatherSize == 10) return;
            if(contains.call(players, pName)) return;

            gatherSize++;

            players.push(pName);
            members.push(message.member);
            message.channel.send(pName + " joined the gather (**" + gatherSize + "**/10)"); 

            if(gatherSize == 10){
                 message.channel.send("**The gather is ready!**"); 
                  var embed = new Discord.RichEmbed()
                .addField("-",
                players[0] 
                + "\n\n" + players[1] 
                + "\n\n" + players[2] 
                + "\n\n" + players[3] 
                + "\n\n" + players[4], true)
                .addField("-",                
                "\n\n" + players[5] 
                + "\n\n" + players[6]
                + "\n\n" + players[7] 
                + "\n\n" + players[8]
                + "\n\n" + players[9], true)
                .setColor('CYAN');
                message.channel.sendEmbed(embed);

                /*
                for(var i = 0; i < gatherSize; i++)
                    members[i].addRole(members[i].guild.roles.find("name", "Gather")); 
                */
                message.channel.send("**Organizing teams ...**"); 

                getRoles(message);
                console.log(members_rank);
                console.log(ranks);
                calculateAmount();
                console.log(Blue);
                console.log(Red);
                organizeNames();
                console.log(Blue_Names);
                console.log(Red_Names);

                embedB = new Discord.RichEmbed()
                .addField("Blue Team",
                Blue_Names[0]
                + "\n\n" + Blue_Names[1]
                + "\n\n" + Blue_Names[2]
                + "\n\n" + Blue_Names[3]
                + "\n\n" + Blue_Names[4], true)
                .setColor('BLUE')
                .addField("Ranks",
                rank_to_string(Blue_IDS[0])
                + "\n\n" + rank_to_string(Blue_IDS[1])
                + "\n\n" + rank_to_string(Blue_IDS[2])
                + "\n\n" + rank_to_string(Blue_IDS[3])
                + "\n\n" + rank_to_string(Blue_IDS[4]), true);
                

                embedR = new Discord.RichEmbed()
                .addField("Red Team",
                Red_Names[0]
                + "\n\n" + Red_Names[1]
                + "\n\n" + Red_Names[2]
                + "\n\n" + Red_Names[3]
                + "\n\n" + Red_Names[4], true)
                .setColor('RED')
                .addField("Ranks",
                rank_to_string(Red_IDS[0])
                + "\n\n" + rank_to_string(Red_IDS[1])
                + "\n\n" + rank_to_string(Red_IDS[2])
                + "\n\n" + rank_to_string(Red_IDS[3])
                + "\n\n" + rank_to_string(Red_IDS[4]), true);

                message.channel.sendEmbed(embedB);
                message.channel.sendEmbed(embedR);

                /*
                setTimeout(function(){
                    console.log("Removing gather role from members .. ")
                    for(var i = 0; i < gatherSize; i++)
                        members[i].removeRole(members[i].guild.roles.find("name", "Gather")); 
                    gather = false;
                }, 30000);
                */
            }

            break;
        case "list":
            if(!message.member.roles.has("288979928160927744")) return;
            var playersPrint = ['-', '-', '-','-','-','-', '-', '-','-','-'];
            for(var i = 0; i < 10; i++){
                if(players[i] != null)
                    playersPrint[i] = players[i];
            }
            var placesLeft = 10 - players.length;
            var embed = new Discord.RichEmbed()
                .addField("Players",
                playersPrint[0] 
                + "\n\n" + playersPrint[1] 
                + "\n\n" + playersPrint[2] 
                + "\n\n" + playersPrint[3] 
                + "\n\n" + playersPrint[4], true)
                .addField(placesLeft + " left",                
                "\n\n" + playersPrint[5] 
                + "\n\n" + playersPrint[6]
                + "\n\n" + playersPrint[7] 
                + "\n\n" + playersPrint[8]
                + "\n\n" + playersPrint[9], true)
                .setColor('CYAN');
                message.channel.sendEmbed(embed);

            break;
        case "help":
            if(!message.member.roles.has("288980244516306944") && !message.member.roles.has("288979928160927744")){
                message.channel.send("Nagisa bot is exclusive for the anime freaks");
                return;
            } 
            var embed = new Discord.RichEmbed()
                .addField("Commands",
                "~ask [question] - ask Nagisa a question" 
                + "\n\n" + "~play [link] - play a song"
                + "\n\n" + "~volume 10-150 - change the volume"
                + "\n\n" + "~pause - pause the current song"
                + "\n\n" + "~resume - resume after pausing"
                + "\n\n" + "~stop - stop playing songs")
                .setColor('ORANGE');
                message.channel.sendEmbed(embed);
            break;
        default:
            message.channel.send("I don't know this command >.<");
    }
});

bot.login(TOKEN);

function rank_to_string(rank_num){
    if(rank_num == 6)
        return 'Diamond 1';
    if(rank_num == 5.75)
        return 'Diamond 2';
    if(rank_num == 5.5)
        return 'Diamond 3';
    if(rank_num == 5.25)
        return 'Diamond 4';
    if(rank_num == 4.25)
        return 'Diamond 5';
    if(rank_num == 4)
        return 'Platinum';
    if(rank_num == 3)
        return 'Gold';
    if(rank_num == 2)
        return 'Silver';
    if(rank_num == 1)
        return 'Bronze';  
    if(rank_num == 0)
        return 'Unranked'; 
}

function organizeNames(){
    // Red
    for(var i = 0; i < 6; i+= 0.25){
        var rank_lf = Red.pop();
        for(var j = 0; j < members_rank.length; j++){
            if(members_rank[j] == rank_lf){
                Red_IDS.push(members_rank[j]);
                Red_Names.push(players[j]);
                members_rank[j]+=10;
                j = members_rank.length;
            }
        }
    }
    // Blue
    for(var i = 0; i < 6; i+= 0.25){
        var rank_lf = Blue.pop();
        for(var j = 0; j < members_rank.length; j++){
            if(members_rank[j] == rank_lf){
                Blue_IDS.push(members_rank[j]);
                Blue_Names.push(players[j]);
                members_rank[j]+=10;
                j = members_rank.length;
            }
        }
    }
}

function calculateAmount(){   
    while(Red.length + Blue.length < 10){
        if(Red.length > Blue.length){
            var rankToAdd = 0;
            while(ranks[rankToAdd] == 0) rankToAdd++;
            addRank(1, rankToAdd);
        }else if(Red.length < Blue.length){
            var rankToAdd = 0;
            while(ranks[rankToAdd] == 0) rankToAdd++;
            addRank(-1, rankToAdd);
        }else{
            var rankToAdd = 0;
            while(ranks[rankToAdd] == 0) rankToAdd++;
            if(ranks[rankToAdd] == 1){
                if(teamAvg(1) >= teamAvg(-1)) addRank(1, rankToAdd);
                else addRank(-1, rankToAdd);
            }else{
                if(teamAvg(1) >= teamAvg(-1)) addRank(-1, rankToAdd);
                else addRank(1, rankToAdd);
            }
        }
       
    }
}

function addRank(team, rankNumber){
    var toPush = rankNumber;
    if(rankNumber == 5)
        toPush = 4.25;
    else if(rankNumber == 6)
        toPush = 5.25;
    else if(rankNumber == 7)
        toPush = 5.5;
    else if(rankNumber == 8)
        toPush = 5.75;
    else if(rankNumber == 9)
        toPush = 6;
        
    if(team == 1) Blue.push(toPush);
    if(team == -1) Red.push(toPush);
    ranks[rankNumber]--;
}

function teamAvg(team){
    var sum = 0;
    if(team == 1){
        for(var i = 0; i < Blue.length; i++)
            sum +=Blue[i];
        if(Blue.length != 0) sum = sum / Blue.length;
        //console.log("Blue AVG: " + sum);
    }
    else if(team == -1){
        for(var i = 0; i < Red.length; i++)
            sum += Red[i];
        if(Red.length != 0) sum = sum / Red.length;
        //console.log("Red AVG: " + sum);
    }
    
    return sum;
}

function getRoles(message){
    let Diamond1 = message.guild.roles.find("name", "Diamond 1");
    let Diamond2 = message.guild.roles.find("name", "Diamond 2");
    let Diamond3 = message.guild.roles.find("name", "Diamond 3");
    let Diamond4 = message.guild.roles.find("name", "Diamond 4");
    let Diamond5 = message.guild.roles.find("name", "Diamond 5");
    let Platinum = message.guild.roles.find("name", "Platinum");
    let Gold = message.guild.roles.find("name", "Gold");
    let Silver = message.guild.roles.find("name", "Silver");
    let Bronze = message.guild.roles.find("name", "Bronze");
    for(var i = 0; i < members.length; i++){   
        var role = members[i].roles; 
        if(role.has(Diamond1.id)){
           members_rank[i] = 6;
           ranks[9]++;
        } 
        else if(role.has(Diamond2.id)){
           members_rank[i] = 5.75;
           ranks[8]++;
        } 
        else if(role.has(Diamond3.id)){
           members_rank[i] = 5.5;
           ranks[7]++;
        } 
        else if(role.has(Diamond4.id)){
           members_rank[i] = 5.25;
           ranks[6]++; 
        }
        else if(role.has(Diamond5.id)){
           members_rank[i] = 4.25;
           ranks[5]++;
        } 
        else if(role.has(Platinum.id)){
           members_rank[i] = 4;
           ranks[4]++;
        } 
        else if(role.has(Gold.id)){
           members_rank[i] = 3;
           ranks[3]++;
        } 
        else if(role.has(Silver.id)){
           members_rank[i] = 2;
           ranks[2]++;
        } 
        else if(role.has(Bronze.id)){
           members_rank[i] = 1;
           ranks[1]++;
        } 
        else{
           members_rank[i] = 0;
           ranks[0]++;
        } 
    }
    return;
}

var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};