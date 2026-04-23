import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetFooter } from "@/api/generated/backend-api.ts";
import { UserEntityDtoRole } from "@/api/generated/model";
import duck1 from "@/assets/ducks/duck1.png";
import duck2 from "@/assets/ducks/duck2.png";
import duck3 from "@/assets/ducks/duck3.png";
import duck4 from "@/assets/ducks/duck4.png";
import duck5 from "@/assets/ducks/duck5.png";
import duck6 from "@/assets/ducks/duck6.png";
import duck7 from "@/assets/ducks/duck7.png";
import duck8 from "@/assets/ducks/duck8.png";
import duck9 from "@/assets/ducks/duck9.png";
import { useRequireRoles } from "@/utils/routeGuards";
import EditFooterModal from "./EditFooterModal";

interface FooterProps {
  bgImageFooter: string;
}

const allDucks = [
  {
    src: duck1,
    name: "EcoFreshKase",
    alt: "EcoFreshKase's GitHub Link",
    link: "https://github.com/EcoFreshKase",
  },
  {
    src: duck2,
    name: "Anni",
    alt: "Anni's LinkedIn Link",
    link: "https://de.linkedin.com/in/annika-schatter",
    site: "LinkedIn",
  },
  { src: duck3, name: "Fiete", alt: "Fiete's GitHub Link", link: "https://github.com/fietensen" },
  { src: duck4, name: "Janne", alt: "Janne's GitHub Link", link: "https://github.com/Janne6565" },
  { src: duck5, name: "Joon", alt: "Joon's GitHub Link", link: "https://github.com/joonjester" },
  { src: duck6, name: "Lars", alt: "Lars's GitHub Link", link: "https://github.com/Larsbobo" },
  { src: duck7, name: "LeeSoko", alt: "LeeSoko's GitHub Link", link: "https://github.com/LeeSoko" },
  { src: duck8, name: "Lemuri", alt: "Lemuri's GitHub Link", link: "https://github.com/MCLemuri" },
  { src: duck9, name: "PyBay", alt: "PyBay's GitHub Link", link: "https://github.com/py-bay" },
];

const getDucks = () => {
  const shuffled = [...allDucks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
};

const Footer = ({ bgImageFooter }: FooterProps) => {
  const { t } = useTranslation();
  const { data: footerData, isLoading } = useGetFooter();
  const isOwner = useRequireRoles([UserEntityDtoRole.OWNER]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [[duck1, duck2]] = useState(() => getDucks());

  return (
    <div className="relative w-full">
      <img
        src={bgImageFooter}
        alt="BG Bottom"
        className="w-full h-auto block"
        style={{ imageRendering: "pixelated" }}
      />

      <TooltipWrapper
        tooltip={t("footer.duckTooltip", {
          name: duck1.name,
          site: duck1.site ? duck1.site : "GitHub",
        })}
      >
        <a
          href={duck1.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-[12.5vw] left-[43vw] w-[5vw] h-auto z-30"
        >
          <img
            src={duck1.src}
            alt={duck1.alt}
            className="w-full h-auto scale-x-[-1] hover:-translate-y-0.5 transition-transform transition-duration-150"
            style={{ imageRendering: "pixelated" }}
          />
        </a>
      </TooltipWrapper>
      <TooltipWrapper
        tooltip={t("footer.duckTooltip", {
          name: duck2.name,
          site: duck2.site ? duck2.site : "GitHub",
        })}
      >
        <a
          href={duck2.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-[13vw] left-[51vw] w-[5vw] h-auto z-30"
        >
          <img
            src={duck2.src}
            alt={duck2.alt}
            className="w-full h-auto hover:-translate-y-0.5 transition-transform transition-duration-150"
            style={{ imageRendering: "pixelated" }}
          />
        </a>
      </TooltipWrapper>

      <div
        className="absolute top-[14vw] left-0 right-0 flex items-center justify-between px-[2vw] z-20"
        style={{ gap: "2vw" }}
      >
        {/* Left side - Title and Description */}
        <div className="flex-1 text-left" style={{ fontSize: "1vw", color: "#87FF97" }}>
          <h3
            className="font-bold"
            style={{ color: "#87FF97", fontSize: "1vw", marginBottom: "1vw" }}
          >
            {t("footer.title")}
          </h3>
          <p style={{ maxWidth: "30vw", lineHeight: "1" }}>{t("footer.description")}</p>
        </div>

        {/* Right side - Imprint */}
        <div className="flex-1 text-right">
          <div className="flex items-start justify-end" style={{ gap: "1vw" }}>
            <TooltipWrapper tooltip={isOwner ? t("footer.edit") : undefined}>
              {isOwner ? (
                <button
                  type="button"
                  style={{
                    fontSize: "1vw",
                    color: "#87FF97",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setEditModalOpen(true)}
                >
                  {isLoading ? (
                    <p>{t("common.loading")}</p>
                  ) : footerData ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto auto",
                        gap: "0.5vw 2vw",
                        justifyContent: "end",
                      }}
                    >
                      <p className="font-bold" style={{ textAlign: "right" }}>
                        {t("footer.contact")}
                      </p>
                      <p style={{ textAlign: "right" }}>{footerData.full_name}</p>
                      <p style={{ textAlign: "right" }}>{footerData.email}</p>
                      <p style={{ textAlign: "right" }}>{footerData.street}</p>
                      <p style={{ textAlign: "right" }}>{footerData.phone}</p>
                      <p style={{ textAlign: "right" }}>{footerData.city}</p>
                    </div>
                  ) : (
                    <p>{t("footer.noData")}</p>
                  )}
                </button>
              ) : (
                <div style={{ fontSize: "1vw", color: "#87FF97" }}>
                  {isLoading ? (
                    <p>{t("common.loading")}</p>
                  ) : footerData ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto auto",
                        gap: "0.5vw 2vw",
                        justifyContent: "end",
                      }}
                    >
                      <p className="font-bold" style={{ textAlign: "right" }}>
                        {t("footer.contact")}
                      </p>
                      <p style={{ textAlign: "right" }}>{footerData.full_name}</p>
                      <p style={{ textAlign: "right" }}>{footerData.email}</p>
                      <p style={{ textAlign: "right" }}>{footerData.street}</p>
                      <p style={{ textAlign: "right" }}>{footerData.phone}</p>
                      <p style={{ textAlign: "right" }}>{footerData.city}</p>
                    </div>
                  ) : (
                    <p>{t("footer.noData")}</p>
                  )}
                </div>
              )}
            </TooltipWrapper>
          </div>
        </div>
      </div>

      {isOwner && (
        <EditFooterModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          footerData={footerData}
        />
      )}
    </div>
  );
};

export default Footer;
