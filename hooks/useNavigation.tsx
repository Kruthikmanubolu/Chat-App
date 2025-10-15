import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation"
import { useMemo } from "react";



export const useNavigation = () => {
    const pathname = usePathname();

    const requestsCount = useQuery(api.requests.count);

    const conversations = useQuery(api.conversations.get)

    const unSeenMessagesCount = useMemo(() => {
        return conversations?.reduce((acc, curr) => {
            return acc + curr.unSeenCount;
        },0)
    }, [conversations])

    const paths = useMemo(() => [
        {
            name: "Conversations",
            href: "/conversations",
            icon: <MessageSquare />,
            active: pathname.startsWith("/conversations"),
            count: unSeenMessagesCount
        },

        {
            name: "Fonversations",
            href: "/friends",
            icon: <Users />,
            active: pathname === "/friends",
            count: requestsCount
        }
    ], [pathname, requestsCount, unSeenMessagesCount])

    return paths;
}
