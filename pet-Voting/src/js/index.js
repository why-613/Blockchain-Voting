Index = {
    web3Provider: null,
    contracts: {},

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            Index.web3Provider = web3.currentProvider;
        } else {
            Index.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(Index.web3Provider);
        Index.initContract();
    },

    initContract: function () {

        $.getJSON('Voting.json', function (data) {
            var Artifact = data;

            Index.contracts.Voting = TruffleContract(Artifact);

            Index.contracts.Voting.setProvider(Index.web3Provider);
            //console.log(Index.contracts.Voting);
            //Index.setCounts();
        });
         Index.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-block', Index.handleSignin);
    },

    handleSignin: function() {
      var VotingInstance;
      var user_id = $("#user_id").val();
	  //console.log("user_id: " + user_id);
      //console.log(user_id.toLowerCase());
      var frontAccount = user_id.toLowerCase();
      var RegisterStartTime;
      var VoteEndTime;
      var date = new Date();
      var month = date.getMonth() + 1;
      var time = date.getFullYear() +"-"+ month +"-"+ date.getDate()+" "+date.getHours()+":"+date.getMinutes();
      var timeDate = new Date(time.replace(/-/g,"\/"));
      console.log("Success! Got result: " + time);
      //alert(timeDate);
      //console.log(registerId);  
	  
      // 获取用户账号
      web3.eth.getAccounts(function (error, accounts) {		  
		//console.log("accounts: " + accounts);
        //if (error) {
         // console.log(web3.eth.getAccountserror);
        //}
		
		/* 新版的方式 */
		  var web3Provider;
		  if (window.ethereum) {
			web3Provider = window.ethereum;
			async function insideFn() {
			// 请求用户授权
			  await window.ethereum.enable();
			} 
		  } else if (window.web3) {   // 老版 MetaMask Legacy dapp browsers...
			web3Provider = window.web3.currentProvider;
		  } else {
			web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
		  }
		  web3js = new Web3(web3Provider);//web3js就是你需要的web3实例
		 
		  web3js.eth.getAccounts(function (error, accounts) {
			if (!error)
			  console.log(accounts)//授权成功后result能正常获取到账号了
		  });
		 
		
		
		//判断用户是否安装MetaMask钱包插件
		if (typeof window.ethereum === "undefined") {
			//没安装MetaMask钱包进行弹框提示
			Message.warning("请安装MetaMask")
		} else {
			//如果用户安装了MetaMask，你可以要求他们授权应用登录并获取其账号
			ethereum.enable()
				.catch(function(reason) {
					//如果用户拒绝了登录请求
					if (reason === "User rejected provider access") {
						// 用户拒绝登录后执行语句；
					} else {
						// 本不该执行到这里，但是真到这里了，说明发生了意外
						Message.warning("There was a problem signing you in");
					}
				}).then(function(accounts) {
					// 判断是否连接以太
					if (ethereum.networkVersion !== desiredNetwork) {}
					let currentProvider = web3.currentProvider;
					web3.setProvider(currentProvider);
					//如果用户同意了登录请求，你就可以拿到用户的账号
					web3.eth.defaultAccount = accounts[0];

					myContract = new web3.eth.Contract(ABI, metaMaskAddress);
					//这里返回用户钱包地址
					callback(accounts[0]);
				});
		}
		
		//有效获取账户	
        var account = accounts[0];
		console.log("account: " + account);
        //alter(account);
        Index.contracts.Voting.deployed().then(function (instance) {
          VotingInstance = instance;

          //get RegisterStartTime
          VotingInstance.getRegisterStartTime.call({from:account}).then((result) => {
            console.log("Success! Got result: " + result);
            RegisterStartTime = new Date(result.replace(/-/g,"\/"));
            //alert(RegisterStartTime);

            //get VoteEndTime
            VotingInstance.getVoteEndTime.call({from:account}).then((result) => {
              console.log("Success! Got result: " + result);
              VoteEndTime = new Date(result.replace(/-/g,"\/"));
              //alert(VoteEndTime);

              //根据时间进行页面的跳转
              if(user_id ==  "0x478eC726B4f83320bF90154F05C57B577F871390"){//该账号设置为管理员账号
				//console.log("account: " + account);
                if(account == 0x478eC726B4f83320bF90154F05C57B577F871390){
                  if(timeDate > RegisterStartTime  && timeDate  < VoteEndTime){
                    window.location.href="note.html";
                  }
                  else if (timeDate> VoteEndTime ) {
                    window.location.href="result.html";
                  }
                  else{
                    window.location.href="project.html";
                  }
                }
                else {
                  alert("请同时用管理员账户登录Metamask");
                }
              }
              else{
                if(frontAccount == account){
                  if(timeDate < RegisterStartTime ){
                    alert("投票系统还未开放");
                    window.location.href="index.html";
                  }
                  else if(timeDate > VoteEndTime ){
                    alert("投票已截止");
                    window.location.href="result.html";
                  }
                  else{
                    VotingInstance.VaildID.call({from:account}).then((vaildornot) => {
                      console.log("Success! Got Vote: " + vaildornot);
                      if(!vaildornot){
                        alert("请先注册！");
                        window.location.href="login.html";
                      }
                      else{
                        window.location.href="vote.html";
                      }
                    }).catch((err) => {
                      console.log("Failed with error: " + err);
                    });
                  }
                }
                else{
                  alert("请同时用该账户登录Metamask");
                }
              }
              }).catch((err) => {
              console.log("Failed with error: " + err);
              });

            //$("#projectName").html("投票项目: " + projectName);
            }).catch((err) => {
              console.log("Failed with error: " + err);
            });

        });
      });
    }
};

$(function () {
    $(window).load(function () {
        Index.initWeb3();
    });
});
