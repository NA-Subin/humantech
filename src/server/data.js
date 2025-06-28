// src/providers/BasicDataProvider.js
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        company: {},
        positions: {},
        officers: {},
        drivers: {},
        creditors: {},
        reghead: {},
        regtail: {},
        small: {},
        transport: {},
        depots: {},
        gasstation: {},
        customertransports: {},
        customergasstations: {},
        customerbigtruck: {},
        customersmalltruck: {},
        customertickets: {}
    });

    const [loading, setLoading] = useState(true);

    const refs = useMemo(() => ({
        company: ref(database, "/company"),
        positions: ref(database, "/positions"),
        officers: ref(database, "/employee/officers"),
        drivers: ref(database, "/employee/drivers"),
        creditors: ref(database, "/employee/creditors"),
        reghead: ref(database, "/truck/registration/"),
        regtail: ref(database, "/truck/registrationTail/"),
        small: ref(database, "/truck/small/"),
        transport: ref(database, "/truck/transport/"),
        depots: ref(database, "/depot/oils"),
        gasstation: ref(database, "/depot/gasStations/"),
        customertransports: ref(database, "/customers/transports/"),
        customergasstations: ref(database, "/customers/gasstations/"),
        customerbigtruck: ref(database, "/customers/bigtruck/"),
        customersmalltruck: ref(database, "/customers/smalltruck/"),
        customertickets: ref(database, "/customers/tickets/")
    }), []);

    useEffect(() => {
        let loadedCount = 0;
        const totalRefs = Object.keys(refs).length;

        const unsubscribes = Object.entries(refs).map(([key, refItem]) =>
            onValue(refItem, snapshot => {
                setData(prev => ({
                    ...prev,
                    [key]: snapshot.val() || {}
                }));
                loadedCount++;
                if (loadedCount === totalRefs) {
                    setLoading(false); // ✅ ข้อมูลโหลดครบทุก path แล้ว
                }
            })
        );

        return () => unsubscribes.forEach(unsub => unsub());
    }, [refs]);

    return (
        <DataContext.Provider value={{ ...data, loading }}>
            {children}
        </DataContext.Provider>
    );
};
