import GameServerDisplay from "@components/display/GameServer/GameServerDisplay/GameServerDisplay.tsx";
import { createFileRoute } from "@tanstack/react-router";
import bgImage from "@/assets/ai-generated/main-page/background.png";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import { InviteRedemptionModal } from "@components/display/InviteRedemptionModal/InviteRedemptionModal.tsx";

interface IndexSearch {
  inviteToken?: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    return {
      inviteToken: typeof search.inviteToken === "string" ? search.inviteToken : undefined,
    };
  },
  component: Index,
});

function Index() {
  const gameServers = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const { inviteToken } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleCloseInvite = () => {
    navigate({
      search: {},
      replace: true,
    });
  };

  return (
    <div
      className="
                  h-screen
                  w-screen
                  flex
                  flex-row
                  justify-center
                  items-center
            "
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: "100% auto",
        backgroundPosition: "center top",
      }}
    >
      <GameServerDisplay gameServerConfigurations={gameServers} />
      {inviteToken && (
        <InviteRedemptionModal inviteToken={inviteToken} onClose={handleCloseInvite} />
      )}
    </div>
  );
}

export default Index;
