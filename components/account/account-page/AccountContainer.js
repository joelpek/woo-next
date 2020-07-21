import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import Account from "./Account";
import { v4 } from "uuid";
import { useMutation, useQuery } from "@apollo/react-hooks";

const AccountContainer = () => {
  return (
    <div className="content-wrap-account">
      <Account />
    </div>
  );
};

export default AccountContainer;
