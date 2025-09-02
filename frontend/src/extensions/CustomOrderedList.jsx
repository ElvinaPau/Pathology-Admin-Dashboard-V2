import { OrderedList } from "@tiptap/extension-ordered-list";

const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: "decimal",
        parseHTML: element => element.style.listStyleType || "decimal",
        renderHTML: attributes => ({
          style: `list-style-type: ${attributes.listStyleType}`,
        }),
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setListStyleType:
        (listStyleType) =>
        ({ commands }) => {
          return commands.updateAttributes("orderedList", { listStyleType });
        },
    };
  },
});

export default CustomOrderedList;
