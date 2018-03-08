const Discord = require("discord.js");
const TOKEN = process.env.TOKEN;

const express = require('express');
const app = express();

var bot = new Discord.Client();

const PREFIX = "~";

var fortunes = ["Gnar!", "Shubbanuffa", "Vimaga", "Nakotak", "Kshaa", "Vigishu!", "Wap!", "Hwa!", "Vrooboo", "Raag!", "Wabbo!"];
var servers =  {}; 
var URL;
var dispatcher;
var stream;
var currConnection;

var code = "code";
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


bot.on("ready", function() {
    console.log("Gnar Bot, ONLINE");
    bot.user.setGame('EGO VEGO')
});

bot.on("message", function(message) {
    if(message.author.equals(bot.user)) return;
    if(!message.content.startsWith(PREFIX)) return;
    if(message.channel.name != "general" && message.channel.name != "anime_freaks") return;
    
    var args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0].toLowerCase()){
        case "info":
            message.channel.send("Gnar Bot, made by Orangę");
            break;
        case "ask":
            if(args[1])
                 message.channel.send(fortunes[Math.floor(Math.random() * fortunes.length)]);
             else
                message.channel.send("'" + PREFIX + "ask [question]'");
             break;
        case "remove":
            if(!gather) return;
            if(!message.member.roles.has("288979928160927744")) return;
            if(!args[1]){
                message.channel.send("The command is: ~remove [number]");
                return;
            }

            var j = 0;
            var numRem = args[1]-1;
            var nameRem = players[numRem];
            var tempPlayers = [];
            players[numRem] = null;
            for(var i = 0; i < 10; i++){
                if(players[i] != null){
                    tempPlayers[j] = players[i];
                    j++;
                }     
            }
            players = [];
            for(var i = 0; i < tempPlayers.length; i++)
                players[i] = tempPlayers[i];
            // ---------------------------------------------------
            j = 0;
            var memberRem = members[numRem];
            var tempPlayers = [];
            members[numRem] = null;
            for(var i = 0; i < 10; i++){
                if(members[i] != null){
                    tempPlayers[j] = members[i];
                    j++;
                }
                    
            }
            members = [];
            for(var i = 0; i < tempPlayers.length; i++)
                members[i] = tempPlayers[i];

            gatherSize--;
            message.channel.send(nameRem + " has been removed from the gather");
            break;
        case "gather":
            //if(!message.member.roles.has("288979928160927744")) return;
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
            if(!gather) // Gather is open?
				message.channel.send("Gather isn't open at the moment");  
            if(gatherSize == 10) return; // Gather is full?
            if(contains.call(players, pName)) return; // Player already in gather?

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

                members_rank = [];
                ranks = [0, 0, 0, 0 ,0, 0, 0, 0 ,0 ,0];
                Blue = [];
                Red = [];
                Red_Names = [];
                Blue_Names = [];
                Red_IDS = [];
                Blue_IDS = [];
              
            }

            break;
        case "list":
            //if(!message.member.roles.has("288979928160927744")) return;
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
            var embed = new Discord.RichEmbed()
                .addField("Commands",
                "~ask [question] - ask Gnar a question"
				+ "\n" +
				"~gather [code] - open a gather")
                .setColor('ORANGE');
                message.channel.sendEmbed(embed);
            break;
        default:
            message.channel.send("I don't know this command ;-;");
    }
});

bot.login(TOKEN);

// To keep bot awake
setInterval(() => {
    http.get('http://nagisabot.herokuapp.com');
  }, 900000);

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
