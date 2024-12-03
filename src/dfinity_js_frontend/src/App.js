import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import Products from "./components/marketplace/Products";
import "./App.css";
import Wallet from "./components/Wallet";
import coverImg from "./assets/img/sandwich.jpg";
import { login, logout as destroy, isAuthenticated, getPrincipalText } from "./utils/auth";
import { tokenBalance, tokenSymbol } from "./utils/icrc2_ledger";
import { icpBalance } from "./utils/ledger";
import { getAddressFromPrincipal } from "./utils/marketplace";
import Cover from "./components/utils/Cover";
import { Notification } from "./components/utils/Notifications";

const App = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [principal, setPrincipal] = useState('');
    const [icrcBalance, setICRCBalance] = useState('');
    const [balance, setICPBalance] = useState('');
    const [symbol, setSymbol] = useState('');
    const [address, setAddress] = useState('');

    // Fetch token symbol once during app initialization
    useEffect(() => {
        (async () => {
            const fetchedSymbol = await tokenSymbol();
            setSymbol(fetchedSymbol);
        })();
    }, []);

    // Check if the user is authenticated
    useEffect(() => {
        (async () => {
            const isAuthenticatedUser = await isAuthenticated();
            setAuthenticated(isAuthenticatedUser);
        })();
    }, []);

    // Fetch principal and related address if authenticated
    useEffect(() => {
        if (authenticated) {
            (async () => {
                const fetchedPrincipal = await getPrincipalText();
                setPrincipal(fetchedPrincipal);

                const account = await getAddressFromPrincipal(fetchedPrincipal);
                setAddress(account.account);
            })();
        }
    }, [authenticated]);

    // Fetch ICRC token balance
    const getICRCBalance = useCallback(async () => {
        if (authenticated) {
            const balance = await tokenBalance();
            setICRCBalance(balance);
        }
    }, [authenticated]);

    // Fetch ICP balance
    const getICPBalance = useCallback(async () => {
        if (authenticated) {
            const balance = await icpBalance();
            setICPBalance(balance);
        }
    }, [authenticated]);

    // Update balances when authenticated
    useEffect(() => {
        getICRCBalance();
    }, [getICRCBalance]);

    useEffect(() => {
        getICPBalance();
    }, [getICPBalance]);

    return (
        <>
            <Notification />
            {authenticated ? (
                <Container fluid="md">
                    <Nav className="justify-content-end pt-3 pb-5">
                        <Nav.Item>
                            <Wallet
                                address={address}
                                principal={principal}
                                icpBalance={balance}
                                icrcBalance={icrcBalance}
                                symbol={symbol}
                                isAuthenticated={authenticated}
                                destroy={destroy}
                            />
                        </Nav.Item>
                    </Nav>
                    <main>
                        <Products tokenSymbol={symbol} />
                    </main>
                </Container>
            ) : (
                <Cover name="Street Food" login={login} coverImg={coverImg} />
            )}
        </>
    );
};

export default App;
