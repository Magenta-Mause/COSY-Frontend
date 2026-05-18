import { DeleteGameServerSuccessDialog } from "@components/display/GameServer/DeleteGameServerAlertDialog/DeleteGameServerSuccessDialog";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect, useMemo, useRef } from "react";
import GameServerBackground from "@/components/display/GameServer/GameServerBackground/GameServerBackground.tsx";
import GameServerDisplay from "@/components/display/GameServer/GameServerDisplay/GameServerDisplay.tsx";
import LoginDisplay from "@/components/display/Login/LoginDisplay/LoginDisplay.tsx";
import { InviteRedemptionModal } from "@/components/display/UserManagement/UserInvite/InviteRedemptionModal/InviteRedemptionModal.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";

interface IndexSearch {
  inviteToken?: string;
  deleted?: boolean;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    return {
      inviteToken: typeof search.inviteToken === "string" ? search.inviteToken : undefined,
      deleted:
        typeof search.deleted === "boolean"
          ? search.deleted
          : typeof search.deleted === "string"
            ? search.deleted === "true"
            : undefined,
    };
  },
  component: Index,
});

function Index() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gameServers = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const sortedGameServers = useMemo(
    () =>
      [...gameServers].sort((a, b) => {
        if (!a.created_on && !b.created_on) return 0;
        if (!a.created_on) return -1;
        if (!b.created_on) return 1;
        return a.created_on < b.created_on ? -1 : a.created_on > b.created_on ? 1 : 0;
      }),
    [gameServers],
  );
  const { authorized, canCreateGameServers } = useContext(AuthContext);
  const showConstructionPlace = authorized && canCreateGameServers;
  const { inviteToken, deleted } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleCloseInvite = () => {
    navigate({
      search: {},
      replace: true,
    });
  };

  const handleCloseDeleteSuccess = () => {
    navigate({
      search: inviteToken ? { inviteToken } : {},
      replace: true,
    });
  };

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("homeScrollPosition");
    if (savedPosition && scrollRef.current) {
      scrollRef.current.scrollTo(0, parseInt(savedPosition, 10));
      sessionStorage.removeItem("homeScrollPosition");
    }
  }, []);

  return (
    <GameServerBackground houseCount={sortedGameServers.length + (showConstructionPlace ? 1 : 0)} scrollRef={scrollRef}>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
        <GameServerDisplay gameServerConfigurations={sortedGameServers} />
      </div>

      <div className="absolute top-0 left-0 w-full z-50 flex flex-col items-center pt-20 pointer-events-none">
        <div className="flex flex-row justify-center items-start w-full max-w-75 pointer-events-auto">
          <LoginDisplay />
        </div>

        {inviteToken && (
          <InviteRedemptionModal inviteToken={inviteToken} onClose={handleCloseInvite} />
        )}

        <DeleteGameServerSuccessDialog open={deleted === true} onClose={handleCloseDeleteSuccess} />
      </div>
    </GameServerBackground>
  );
}
