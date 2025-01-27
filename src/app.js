require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/symbols/PictureMarkerSymbol",
  "esri/PopupTemplate",
  "esri/widgets/Legend",
  "esri/widgets/LayerList",
  "esri/rest/support/Query",
  "esri/widgets/Expand",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch",
  "esri/geometry/geometryEngine",
  "esri/widgets/Bookmarks",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Print",
  "esri/rest/support/StatisticDefinition",
], function (
  esriConfig,
  Map,
  MapView,
  FeatureLayer,
  PictureMarkerSymbol,
  PopupTemplate,
  Legend,
  LayerList,
  Query,
  Expand,
  GraphicsLayer,
  Sketch,
  geometryEngine,
  Bookmarks,
  BasemapGallery,
  Print,
  StatisticDefinition
) {
  esriConfig.apiKey =
    "AAPT85fOqywZsicJupSmVSCGrvCS0BRXtX4FpUyN4yond-TKHxCSXup5k841VKzlBpusQS2w-M1J-87zZMSpdNsB-Ioc0Tx7FeBx43SizT_8q_kYfoRjzQUOI2yKF7hqiLwmSKW4Y71HZOpJdJ-i-yTK08Q5NFCoQ6f5THqcTuF2yKAzvZmnK1i7haoanYbx-nD4WNCwirVlLoMWZI1ZnH5ft9Vqz8abKRXoS3JbeCLJRsU.AT2_qdkYrLB1";
  let queriedGeometries = [];
  let queriedParkNames = [];
 
  // STEP 2 - map
  const map = new Map({
    basemap: "arcgis/topographic", // Basemap styles service
  });
  // renderer for trailheads

  const trailheadsRenderer = {
    type: "simple",
    symbol: {
      type: "picture-marker",
      url: "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0231b.png",
      width: "18px",
      height: "18px",
    },
  };

  // Renderer for Trail Lines

  const trailinesRenderer = {
    type: "simple",
    symbol: {
      color: "#BA55D3",
      type: "simple-line",
      style: "solid",
      width: "3px",
    },
  };

  // Popuptemplate for trailheads

  const trailheadPT = new PopupTemplate({
    title: "Name of Trail: {TRL_NAME}",
    content:
      "The Trail head is in: {PARK_NAME} " +
      '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Santa_monica_mountains_canyon.jpg/900px-Santa_monica_mountains_canyon.jpg" width:"300" alt = "Santa Monica Mountains">',
  });
  // STEP 3 - feature layer
  // Trailheads feature layer (points)
  const trailheadsLayer = new FeatureLayer({
    popupTemplate: trailheadPT,
    renderer: trailheadsRenderer,
    title: "Trailheads",
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
  });
  map.add(trailheadsLayer);

  // Trails feature layer (lines)

  const trailsLinesLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
    renderer: trailinesRenderer,
    title: "Trails",
  });

  map.add(trailsLinesLayer, 0);

  // Parks and open spaces (polygons)
  const parksLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0",
  });
  map.add(parksLayer, 0);

  const graphicsLayer = new GraphicsLayer({
    title: "Graphic Layer",
    listMode: "hide",
  });
  map.add(graphicsLayer);

  // STEP 4 - view 2D is MapView
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-118.80543, 34.027],
    zoom: 13,
    padding: {
      left: 49,
    },
  });

  // STEP 5 Create Legend
  let legend = new Legend({
    view: view,
    container: "legend-container",
  });

  // let legendExpand = new Expand({
  //   expandIcon: "legend",
  //   view: view,
  //   content: legend,
  // });
  // view.ui.add(legendExpand, "top-right");

  let layerList = new LayerList({
    view: view,
    container: "layers-container",
  });

  // let layerListExpand = new Expand({
  //   expandIcon: "layers", // see https://developers.arcgis.com/calcite-design-system/icons/
  //   // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
  //   view: view,
  //
  // });
  // view.ui.add(layerListExpand, "top-right");

  let chartExpand = new Expand({
    expandIcon: "graph-bar",
    view: view,
    content: document.getElementById("myChart"),
  });

  view.ui.add(chartExpand, "top-right");

  // WIDGETS
  const basemaps = new BasemapGallery({
    view,
    container: "basemaps-container",
  });
  const bookmarks = new Bookmarks({
    view,
    container: "bookmarks-container",
  });
  const print = new Print({
    view,
    container: "print-container",
  });
  view.when(() => {
    //const { title, description, thumbnailUrl, avgRating } = map.portalItem;
    document.querySelector("#header-title").textContent =
      "WebGIS Application using ArcGIS Maps SDK for JS";
    document.querySelector("#item-description").innerHTML =
      "This map can do queries and so on!";
    // document.querySelector("#item-thumbnail").src = map.basemap.thumbnailUrl;
    document.querySelector("#item-rating").value = 5;
  });

  let activeWidget;

  const handleActionBarClick = ({ target }) => {
    if (target.tagName !== "CALCITE-ACTION") {
      return;
    }

    if (activeWidget) {
      document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
      document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
    }

    const nextWidget = target.dataset.actionId;
    if (nextWidget !== activeWidget) {
      document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
      document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
      activeWidget = nextWidget;
    } else {
      activeWidget = null;
    }
  };

  document
    .querySelector("calcite-action-bar")
    .addEventListener("click", handleActionBarClick);

  let actionBarExpanded = false;

  document.addEventListener("calciteActionBarToggle", (event) => {
    actionBarExpanded = !actionBarExpanded;
    view.padding = {
      left: actionBarExpanded ? 135 : 49,
    };
  });

  //  SKETCH

  const sketch = new Sketch({
    container: "spatial-analysis-container",
    view: view,
    layer: graphicsLayer,
    updateOnGraphicClick: true,
    snappingOptions: {
      enabled: true,
      featureSources: [
        {
          layer: graphicsLayer,
        },
      ],
    },
    visibleElements: {
      createTools: {
        point: false,
        polyline: false,
        circle: false,
      },
      selectionTools: {
        "lasso-selection": false,
        "rectangle-selection": false,
      },
      settingsMenu: false,
      undoRedoMenu: false,
    },
  });

  // view.ui.add(sketch, "top-right");

  sketch.on("create", function (event) {
    if (event.state === "start") {
      console.log("start");
      graphicsLayer.removeAll();
    }
    if (event.state === "complete") {
      console.log("complete");
      let drawnGeometry = event.graphic.geometry;
      let intersectingParks = [];
      for (let i = 0; i < queriedGeometries.length; ++i) {
        const isIntersecting = geometryEngine.intersects(
          queriedGeometries[i],
          drawnGeometry
        );
        if (!isIntersecting) continue;
        intersectingParks.push(queriedParkNames[i]);
        console.log(queriedParkNames[i]);
      }
    }
  });

  ///////////////////////////////////////// Event Listeners//////////////////////////////////////
  document.getElementById("queryButton").addEventListener("click", function () {
    let currentWhere = document.getElementById("whereClause").value;
    queryFeatureLayer(currentWhere);
    queryFeatureLayerCount(currentWhere);

    let viewDivElement = document.getElementById("viewDiv");
    let featTableElement = document.getElementById("featureTablePH");
    viewDivElement.style.height = "60%";
    featTableElement.style.height = "40%";
  });

  function queryFeatureLayerCount(whereClause) {
    const query = new Query();
    query.where = whereClause;
    query.outSpatialReference = { wkid: 102100 };
    query.returnGeometry = false;
    query.outFields = ["*"];
    let statisticDefinition = new StatisticDefinition({
      statisticType: "count",
      onStatisticField: "AGNCY_TYP",
      outStatisticFieldName: "AGNCY_TYPCOUNT",
    });

    query.outStatistics = [statisticDefinition];
    query.groupByFieldsForStatistics = ["AGNCY_TYP"];

    parksLayer.queryFeatures(query).then(function (response) {
      console.log(response);
      let xValues = []; //"Italy", "France", "Spain", "USA", "Argentina"];
      let yValues = []; //55, 49, 44, 24, 15];
      for (let i = 0; i < response.features.length; ++i) {
        let cf = response.features[i];
        xValues.push(cf.attributes["AGNCY_TYP"]);
        yValues.push(cf.attributes["AGNCY_TYPCOUNT"]);
      }

      new Chart("myChart", {
        type: "bar",
        data: {
          labels: xValues,
          datasets: [
            {
              backgroundColor: "rgb(59, 160, 191, 0.7)",
              data: yValues,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Agency Types",
            },
          },
        },
      });

      chartExpand.expand();
    });
  }

  function queryFeatureLayer(whereClause) {
    const query = new Query();
    query.where = whereClause;
    query.outSpatialReference = { wkid: 102100 };
    query.returnGeometry = true;
    query.outFields = ["*"];

    parksLayer.queryFeatures(query).then(function (featureSet) {
      createFeatureTable(featureSet);

      for (let i = 0; i < featureSet.features.length; i++)
        featureSet.features[i].symbol = {
          type: "simple-fill",
          color: [59, 160, 191, 0.58],
        };
      view.graphics.addMany(featureSet.features);
    }),
      function (error) {
        alert(error);
      };
  }

  function createFeatureTable(featureSet) {
    queriedGeometries = [];
    let featureTablePH = document.getElementById("featureTablePH");

    let queriedFeatures = featureSet.features;
    let createTable = "<table>";

    for (let i = 0; i < queriedFeatures.length; i++) {
      let attCurrentFeature = queriedFeatures[i].attributes;

      if (i === 0) {
        createTable += "<tr>";

        for (let currentKey in attCurrentFeature) {
          createTable += "<th>" + currentKey + "</th>";
        }
        createTable += "</tr>";
      }

      queriedGeometries.push(featureSet.features[i].geometry);
      queriedParkNames.push(attCurrentFeature["PARK_NAME"]);

      createTable += "<tr id='feature-" + i + "'>";
      for (let currentKey in attCurrentFeature) {
        createTable += "<td>" + attCurrentFeature[currentKey] + "</td>";
      }
      createTable += "</tr>";
    }

    createTable += "</table>";
    featureTablePH.innerHTML = createTable;
    for (let i = 0; i < queriedFeatures.length; ++i) {
      document
        .getElementById("feature-" + i)
        .addEventListener("click", function () {
          zoomTo(i);
        });
    }
  }

  function zoomTo(position) {
    view.goTo(queriedGeometries[position], { duration: 1000 });
  }
  //document.querySelector("calcite-shell").hidden = false;
  document.querySelector("calcite-loader").hidden = true;
  // Exercise: Find all queried parks in a custom drawn polygon
  // What do/should we have: queried polygons
  // what are the steos to achieve this:
  // 1. Bringing in a Graphics layer
  // 2. Sketch widget(with just the option to draw polygons) for that Graphics layer
  // 3. Delete new old drawn polygons when a new one gets drawn
  // 4. When user draws a polygon and finishes
  // 5. Then check which parks are inside that polygon
  // 6. Create a list with that parks
});
