import { createContext, useState } from "react"

export const QRctxt = createContext();
export const QRrefresh = ({children}) => {
    const [Refresh, setR] = useState(false);
    return(
        <QRctxt.Provider value= {{Refresh, setR}}>
            {children}
        </QRctxt.Provider>
    );
};