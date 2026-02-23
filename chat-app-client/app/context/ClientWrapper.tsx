"use client";

import {ReactNode} from "react";
import {AppProvider} from "./AppContext";
import {SocketProvider} from "./SocketContext";

export default function ClientWrapper({children}: {children: ReactNode}) {
  return (
    <AppProvider>
      <SocketProvider>{children}</SocketProvider>
    </AppProvider>
  );
}
