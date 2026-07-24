import { Badge } from "@/components/ui/badge";

const ResourceUsageBadge = (props: {
  currentValue: string;
  limit: number | string;
  unit?: string;
  resourceType: string;
}) => {
  return (
    <Badge className="px-3 text-sm bg-accent">
      {props.currentValue} / {props.limit} {props.unit} -{" "}
      <div className="font-bold">{props.resourceType}</div>
    </Badge>
  );
};

export default ResourceUsageBadge;
