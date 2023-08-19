import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import Abi from "./Abi";

function BusinessHome() {
  const business = useSelector((store) => store.business);
  const [response,setResponse]=useState(null);
  const [walletBalance,setWalletBalance]=useState("");

  const getBusinessBalance = async (tokenContractAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Prompt user for account connections
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const businessAdd = await signer.getAddress();
    const tokenABI = Abi.tokenABI;
    
  
    // idhar add token contract address by taking it from the :
    // database itself !!
    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      tokenABI,
      provider
    );

    const tokenBalance = await tokenContract.balanceOf(businessAdd);
    console.log("Flip ", tokenBalance/(10**18));
    setWalletBalance(tokenBalance/(10**18));
  };

  useEffect(()=>{
    if(response){
      getBusinessBalance(response.tokenContractAddress);
    }
  },[response]);

  const getResponse = async () => {

    const accessToken=business.data.accessToken;
    const rr = await axios.post(
      "https://flipkartbackend-un9n.onrender.com/getBusinessDetails",{},
      {
        headers: {
          Authorization: "Bearer " + accessToken,
          // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGRkNDY3M2M2ODliMzRkMzY5ZmRlZGYiLCJyb2xlIjoiQ3VzdG9tZXIiLCJpYXQiOjE2OTIyMjMwOTF9.1WFN8JJAVQUkwFVr4a1GA1HfhyGFMFLPIoJHhLdeMpY`, // Provide your access token
        },
      }
    );

    setResponse(rr.data);
    console.log(rr.data);
  };
  useEffect(() => {
    getResponse();
  }, []);

  const handleSubmit = async () => {
    // e.preventDefault();
    await connectWallet();
    // console.log(productId);
    if (window.ethereum) {
      try {
        // Request account access if needed
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Prompt user for account connections
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const contractAddress = "0x06441b211a8729B40FE15955F9A58b2F5829d022"; // Replace with your smart contract address
        const contractABI = Abi.contractABI;

        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const businessAdd = await signer.getAddress();
        // (uint256 _points,address _bAd)
        const _points = ethers.utils.parseUnits("1", "18");
        const transaction = await contract.listProductReward(
          _points,
          businessAdd
        );

        const txResponse = await transaction.wait();
        console.log("Transaction Response : ", txResponse.transactionHash);
          
        
        getBusinessBalance(response.tokenContractAddress);

      } catch (error) {
        console.log(error);
      }
    } else {
      await connectWallet();
    }
  };


  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected to MetaMask");
        console.log(window.ethereum);
      } catch (error) {
        alert("Connect to Metamask !!");
        connectWallet();
      }
    }
  };

  useEffect(() => {
    connectWallet();
  }, []); // means at startup !!

  return (
    <div>
    {response && <div className="w-screen h-screen   flex justify-center items-center from-gray-900 to-gray-600 bg-gradient-to-b">
      <div className="w-[50%] h-[60%] bg-white p-5 rounded-md ">
        <div className="flex justify-between bg-indigo-400 px-4 py-3 shadow-md shadow-gray-300 rounded-md">
          <p className=" text-white text-[20px]">{response.name}</p>
          <p className=" text-white text-[20px]">{response.email}</p>
        </div>

        <div className="flex gap-10 mt-16">
          <p className="bg-green-700 px-5 py-2 text-white w-max text-[20px] rounded-md shadow-md shadow-green-300">
            Token : {response.tokenSymbol}
          </p>
          <p className="bg-red-700 px-5 py-2 text-white w-max text-[20px] rounded-md shadow-md shadow-green-300">
            Balance : {walletBalance}
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-4 ">
          <input
            type="text"
            placeholder="Product Name"
            className="outline-none px-2 py-1"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={handleSubmit}
            className="px-1 py-3 bg-indigo-500 rounded-md text-white text-[18px] shadow-md shadow-blue-400 "
          >
            Add Product
          </motion.button>
        </div>
      </div>
    </div>}</div>
  );
}

export default BusinessHome;
