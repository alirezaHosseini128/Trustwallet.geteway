
'use client';
import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState("در انتظار اتصال کیف پول...");
  let signer, userAddress;

  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const RECEIVER = "0xe68203481859D014cCC911565a745199B11016C8";
  const DECIMALS = 6;
  const AMOUNT = 1 * 10 ** DECIMALS;
  const ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)"
  ];

  async function connectWallet() {
    const { default: WalletConnectProvider } = await import("@walletconnect/web3-provider");
    const { viem } = await import("viem");

    const provider = new WalletConnectProvider({
      rpc: { 1: "https://rpc.ankr.com/eth" },
    });

    await provider.enable();
    const { createWalletClient, custom } = viem;
    signer = createWalletClient({
      chain: { id: 1 },
      transport: custom(provider),
    });
    userAddress = provider.accounts[0];
    setStatus("✅ کیف پول متصل شد: " + userAddress);
  }

  async function checkBalance() {
    const { createPublicClient, http } = await import("viem");
    const client = createPublicClient({
      chain: { id: 1 },
      transport: http("https://rpc.ankr.com/eth"),
    });

    const balance = await client.readContract({
      address: USDT_ADDRESS,
      abi: ABI,
      functionName: "balanceOf",
      args: [userAddress],
    });

    if (Number(balance) >= AMOUNT) {
      setStatus("✅ موجودی کافی است. می‌توانید پرداخت را انجام دهید.");
    } else {
      setStatus("❌ موجودی کافی نیست. حداقل ۱ USDT نیاز است.");
    }
  }

  async function sendUSDT() {
    try {
      const tx = await signer.writeContract({
        address: USDT_ADDRESS,
        abi: ABI,
        functionName: "transfer",
        args: [RECEIVER, AMOUNT],
      });
      setStatus("✅ تراکنش ارسال شد. TX Hash:
" + tx);
    } catch (err) {
      setStatus("❌ خطا در ارسال تراکنش: " + err.message);
    }
  }
async function sendUSDT() {
  try {
    if (!userAddress) {
      await connectWallet();
    }

    const balance = await signer.readContract({
      address: USDT_ADDRESS,
      abi: ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    });

    if (Number(balance) < AMOUNT) {
      setStatus("❌ موجودی کافی نیست.");
      return;
    }

    const tx = await signer.writeContract({
      address: USDT_ADDRESS,
      abi: ABI,
      functionName: 'transfer',
      args: [RECEIVER, AMOUNT],
    });

    setStatus("✅ پرداخت با موفقیت انجام شد. TX: " + tx);
  } catch (err) {
    setStatus("❌ خطا در پرداخت: " + err.message);
  }
}
  return (
    <main style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>پرداخت با Trust Wallet</h2>
      <p>پرداخت ۱ تتر روی شبکه Ethereum (ERC-20)</p>
      <button onClick={connectWallet} style={{ background: '#2980b9', color: '#fff', padding: '12px 24px', margin: '10px', borderRadius: 8 }}>اتصال کیف پول</button>
      <button onClick={checkBalance} style={{ background: '#27ae60', color: '#fff', padding: '12px 24px', margin: '10px', borderRadius: 8 }}>بررسی موجودی</button>
      <button onClick={sendUSDT} style={{ background: '#f39c12', color: '#fff', padding: '12px 24px', margin: '10px', borderRadius: 8 }}>پرداخت</button>
      <p style={{ marginTop: 20 }}>{status}</p>
    </main>
  );
}
