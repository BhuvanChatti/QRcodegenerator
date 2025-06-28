import InfiniteScroll from 'react-infinite-scroll-component';
import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QRctxt } from './Refrshcontext';
function MyQRs() {
    const [l, setL] = useState(true);
    const [QRs, setQ] = useState([]);
    const { Refresh } = useContext(QRctxt);
    useEffect(() => {
        const QRsfetch = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get("https://qrcodegenerator-zuzx.onrender.com/api/myqrs",
                    {
                        headers:
                            { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    });
                console.log("QRs from backend:", res.data.qrs);
                toast.success("QRs Retrieved Successfully");
                setQ(res.data.qrs || []);
            }

            catch (error) {
                console.error('Error retrieving QR code:', error);
                toast.error("Please login to generate QR codes");
            }
            finally {
                setL(false);
            }
        }
        QRsfetch();
    }, [Refresh]);
    return (
        <InfiniteScroll dataLength={QRs.length} next={() => { }} hasMore={false} loader={<h4 className="text-center text-gray-600">loading...</h4>}>
            <div className="flex flex-col items-center">
                {l ? (<p className='text-center text-gray-500bg-white shadow-[0_5px_20px_rgba(53,133,165,1)] rounded-lg p-6 border border-gray-200'>Loading...</p>) :
                    QRs.length > 0 ? (QRs.map((QR) => {
                        const qrurl = URL.createObjectURL(new Blob([new Uint8Array(QR.QRimg.data)], { type: 'image/png' }));
                        return (
                            <div key={QR._id} className="flex justify-between items-center bg-black shadow-md rounded-lg w-full max-w-[560px] p-4 mb-4 border border-gray-200">
                                <div>
                                    <h4 className="text-lg font-semibold text-white truncate max-w-[15ch] overflow-hidden whitespace-nowrap">ID: <span className="font-normal">{QR.ID}</span></h4>
                                    <p className="text-white">amount: ₹{QR.amount}</p>
                                </div>
                                <img src={qrurl} alt="QR" className="w-28 h-28 object-contain rounded border border-blue-600 shadow" />
                            </div>
                        )
                    })
                    ) : (<p className="text-center text-gray-500">No Qr's found</p>)
                };
            </div>
        </InfiniteScroll>
    )
}
export default MyQRs;